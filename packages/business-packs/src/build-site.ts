import { getPreset } from '@siteos/design-system';
import {
  createId,
  type FormDefinition,
  formTemplates,
  type PageDocument,
  type SectionInstance,
  type SiteSettings,
  siteSettingsSchema,
  type ThemeTokens,
} from '@siteos/schemas';
import { registry } from '@siteos/sections';
import { cafeImages, placeholderImages } from './placeholders.ts';
import { buildPageDocument } from './recipes.ts';
import type {
  BuildContext,
  BusinessPack,
  FormTemplateId,
  SiteDetails,
  SuggestedPage,
} from './types.ts';

export type SitePlan = {
  theme: ThemeTokens;
  settings: SiteSettings;
  forms: Array<{ template: FormTemplateId; definition: Omit<FormDefinition, 'id'> }>;
  pages: SuggestedPage[];
};

/** Everything the wizard needs before any record exists. */
export function planSite(
  pack: BusinessPack,
  details: SiteDetails,
  opts: { presetId?: string; colors?: Partial<ThemeTokens['colors']>; pageKeys?: string[] } = {},
): SitePlan {
  const preset =
    getPreset(opts.presetId ?? pack.suggestedPreset) ?? getPreset(pack.suggestedPreset);
  if (!preset) throw new Error(`Unknown theme preset for pack ${pack.id}`);
  const theme: ThemeTokens = {
    ...preset.tokens,
    colors: { ...preset.tokens.colors, ...(opts.colors ?? {}) },
  };
  const settings = siteSettingsSchema.parse({
    tagline: details.tagline,
    description: pack.content.hero.description,
    structuredData: {
      type: pack.structuredDataType,
      telephone: details.phone,
      email: details.email,
      address: {
        street: details.street,
        city: details.city,
        region: '',
        postalCode: '',
        country: '',
      },
    },
  });
  const wanted = new Set<FormTemplateId>(['contact', ...pack.forms]);
  const forms = [...wanted].map((template) => {
    const t = formTemplates.find((x) => x.id === template);
    if (!t) throw new Error(`Unknown form template ${template}`);
    return {
      template,
      definition: {
        name: t.name,
        fields: t.fields,
        settings: {
          submitLabel: t.submitLabel,
          successMessage: 'Thanks, we received your message and will reply soon.',
        },
      },
    };
  });
  const pages = pack.suggestedPages.filter((p) =>
    opts.pageKeys ? opts.pageKeys.includes(p.key) : p.recommended,
  );
  return { theme, settings, forms, pages };
}

export function imagesFor(pack: BusinessPack) {
  return pack.id === 'cafe' || pack.id === 'restaurant' ? cafeImages : placeholderImages;
}

/** Navbar and footer content for the site's globals, linking to the pages that were actually created. */
export function buildGlobals(
  pack: BusinessPack,
  details: SiteDetails,
  pages: Array<{ key: string; id: string; title: string }>,
) {
  const links = pages
    .filter((p) => p.key !== 'home')
    .slice(0, 6)
    .map((p) => ({ label: p.title, link: { kind: 'page' as const, pageId: p.id } }));
  const contact = pages.find((p) => p.key === 'contact');
  const cta = contact
    ? {
        label: pack.content.hero.primaryCta,
        link: { kind: 'page' as const, pageId: contact.id },
        style: 'filled' as const,
      }
    : details.phone
      ? {
          label: 'Call us',
          link: { kind: 'phone' as const, phone: details.phone },
          style: 'filled' as const,
        }
      : null;
  const home = pages.find((p) => p.key === 'home');
  const navbar = registry.create('navbar', {
    variant: 'simple',
    brandName: details.name,
    links: home
      ? [{ label: 'Home', link: { kind: 'page', pageId: home.id } }, ...links].slice(0, 8)
      : links,
    cta,
    spacing: 'none',
  });
  const footer = registry.create('footer', {
    variant: 'columns',
    brandName: details.name,
    tagline: details.tagline || pack.content.hero.description.split('.')[0] || '',
    columns: [
      {
        title: 'Explore',
        links: pages
          .slice(0, 6)
          .map((p) => ({ label: p.title, link: { kind: 'page' as const, pageId: p.id } })),
      },
      {
        title: 'Contact',
        links: [
          ...(details.email
            ? [{ label: details.email, link: { kind: 'email' as const, email: details.email } }]
            : []),
          ...(details.phone
            ? [{ label: details.phone, link: { kind: 'phone' as const, phone: details.phone } }]
            : []),
          ...(details.street
            ? [
                {
                  label: [details.street, details.city].filter(Boolean).join(', '),
                  link: {
                    kind: 'url' as const,
                    href: `https://maps.google.com/?q=${encodeURIComponent([details.name, details.street, details.city].filter(Boolean).join(', '))}`,
                    newTab: true,
                  },
                },
              ]
            : []),
        ],
      },
    ].filter((col) => col.links.length > 0),
    copyright: `© ${new Date().getFullYear()} ${details.name}. All rights reserved.`,
    legalLinks: [],
    theme: 'dark',
  });
  return {
    navbar: {
      name: 'Navigation bar',
      section: { type: navbar.type, schemaVersion: navbar.schemaVersion, props: navbar.props },
    },
    footer: {
      name: 'Footer',
      section: { type: footer.type, schemaVersion: footer.schemaVersion, props: footer.props },
    },
  };
}

/** A page-level placeholder that follows a global section. */
export function globalPlaceholder(
  globalId: string,
  content: { type: string; schemaVersion: number; props: Record<string, unknown> },
): SectionInstance {
  return {
    id: createId('sec'),
    type: content.type,
    schemaVersion: content.schemaVersion,
    hidden: false,
    globalId,
    props: structuredClone(content.props),
  };
}

/** Full document for one planned page, wrapped in navbar/footer placeholders when globals exist. */
export function buildSitePage(
  pack: BusinessPack,
  details: SiteDetails,
  page: SuggestedPage & { id: string },
  refs: {
    pageIds: Record<string, string>;
    formIds: Partial<Record<FormTemplateId, string>>;
    globals?: {
      navbar: {
        id: string;
        section: { type: string; schemaVersion: number; props: Record<string, unknown> };
      };
      footer: {
        id: string;
        section: { type: string; schemaVersion: number; props: Record<string, unknown> };
      };
    };
  },
): PageDocument {
  const ctx: BuildContext = {
    pack,
    details,
    pageIds: refs.pageIds,
    formIds: refs.formIds,
    images: imagesFor(pack),
  };
  const doc = buildPageDocument(page.recipe, ctx, {
    id: page.id,
    slug: page.slug,
    title: page.title,
    description: page.key === 'home' ? pack.content.hero.description : undefined,
  });
  if (!refs.globals) return doc;
  return {
    ...doc,
    sections: [
      globalPlaceholder(refs.globals.navbar.id, refs.globals.navbar.section),
      ...doc.sections,
      globalPlaceholder(refs.globals.footer.id, refs.globals.footer.section),
    ],
  };
}
