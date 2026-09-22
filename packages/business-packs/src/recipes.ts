import type { Button, ImageRef, Link, PageDocument, SectionInstance } from '@siteos/schemas';
import { registry, richTextFromPlain } from '@siteos/sections';
import type { BuildContext, FormTemplateId, RecipeId } from './types.ts';

/**
 * Deterministic page recipes. Every section is produced by `registry.create`, so the result is validated
 * against the section schema at build time; a copy mistake fails a test, never a user.
 */
type Ctx = BuildContext & { anchors: Record<string, string> };

const pageLink = (ctx: Ctx, key: string): Link | null =>
  ctx.pageIds[key] ? { kind: 'page', pageId: ctx.pageIds[key] as string } : null;
const phoneLink = (ctx: Ctx): Link | null =>
  ctx.details.phone ? { kind: 'phone', phone: ctx.details.phone } : null;
const emailLink = (ctx: Ctx): Link | null =>
  ctx.details.email ? { kind: 'email', email: ctx.details.email } : null;
/** Best available "get in touch" target: the form on this page, else the contact page, else phone, else email. */
const contactLink = (ctx: Ctx): Link | null =>
  ctx.anchors.form
    ? { kind: 'anchor', anchor: ctx.anchors.form }
    : (pageLink(ctx, 'contact') ?? phoneLink(ctx) ?? emailLink(ctx));
const button = (
  label: string,
  link: Link | null,
  style: Button['style'] = 'filled',
): Button | null => (link ? { label, link, style } : null);
const img = (ctx: Ctx, i: number): ImageRef => ctx.images[i % ctx.images.length] as ImageRef;
const c = (ctx: Ctx) => ctx.pack.content;

// ---- section builders --------------------------------------------------------------------------------
type HeroOpts = {
  variant?: 'split' | 'centered' | 'background' | 'editorial';
  height?: 'compact' | 'standard' | 'large' | 'full';
  heading?: string;
  description?: string;
  eyebrow?: string;
  withMedia?: boolean;
  secondaryKey?: string;
};
export const b = {
  hero(ctx: Ctx, o: HeroOpts = {}): SectionInstance {
    const h = c(ctx).hero;
    const secondary = o.secondaryKey
      ? pageLink(ctx, o.secondaryKey)
      : (pageLink(ctx, 'about') ?? pageLink(ctx, 'services') ?? pageLink(ctx, 'menu'));
    return registry.create('hero', {
      variant: o.variant ?? 'split',
      height: o.height ?? 'standard',
      eyebrow: o.eyebrow ?? h.eyebrow,
      heading: o.heading ?? h.heading,
      description: o.description ?? h.description,
      alignment: o.variant === 'centered' ? 'center' : 'left',
      media: o.withMedia === false ? null : img(ctx, 0),
      primaryCta: button(h.primaryCta, contactLink(ctx)),
      secondaryCta:
        secondary && h.secondaryCta ? button(h.secondaryCta, secondary, 'outline') : null,
      theme: 'light',
    });
  },
  about(ctx: Ctx, imageIndex = 1): SectionInstance {
    const a = c(ctx).about;
    return registry.create('image-text', {
      variant: 'image-left',
      eyebrow: a.eyebrow,
      heading: a.heading,
      body: richTextFromPlain(a.body),
      image: img(ctx, imageIndex),
      cta: null,
      theme: 'surface',
    });
  },
  features(
    ctx: Ctx,
    o: {
      heading?: string;
      eyebrow?: string;
      variant?: 'three-column' | 'two-column' | 'list' | 'bento';
    } = {},
  ): SectionInstance {
    return registry.create('feature-grid', {
      variant: o.variant ?? 'three-column',
      eyebrow: o.eyebrow ?? 'Why us',
      heading: o.heading ?? `Why people choose ${ctx.details.name}`,
      description: '',
      align: 'center',
      items: c(ctx).features.map((f) => ({
        icon: f.icon,
        title: f.title,
        description: f.description,
        link: null,
        linkLabel: '',
      })),
    });
  },
  services(ctx: Ctx, variant: 'cards' | 'list' | 'image-cards' = 'cards'): SectionInstance {
    return registry.create('services', {
      variant,
      eyebrow: ctx.pack.vocabulary.offerings,
      heading: `What we offer`,
      description: '',
      align: 'left',
      items: c(ctx).services.map((s, i) => ({
        title: s.title,
        description: s.description,
        price: s.price,
        image: variant === 'image-cards' ? img(ctx, i + 1) : null,
        link: null,
      })),
      theme: 'surface',
    });
  },
  process(ctx: Ctx): SectionInstance {
    return registry.create('process', {
      variant: 'horizontal',
      eyebrow: 'How it works',
      heading: 'From first call to done',
      description: '',
      align: 'center',
      steps: c(ctx).process,
    });
  },
  stats(ctx: Ctx): SectionInstance {
    return registry.create('stats', {
      variant: 'row',
      eyebrow: '',
      heading: '',
      description: '',
      align: 'center',
      items: c(ctx).stats.map((s) => ({
        value: s.value,
        label: s.label,
        description: s.description ?? '',
      })),
      theme: 'light',
      spacing: 'compact',
    });
  },
  testimonials(ctx: Ctx): SectionInstance {
    return registry.create('testimonials', {
      variant: 'grid',
      eyebrow: 'Reviews',
      heading: 'What customers say',
      description: '',
      align: 'center',
      items: c(ctx).testimonials.map((t) => ({
        quote: t.quote,
        name: t.name,
        role: t.role,
        image: null,
        rating: t.rating,
      })),
      theme: 'surface',
    });
  },
  faq(ctx: Ctx): SectionInstance {
    return registry.create('faq', {
      variant: 'two-column',
      eyebrow: 'FAQ',
      heading: 'Good to know',
      description: '',
      align: 'left',
      items: c(ctx).faq.map((q) => ({ question: q.question, answer: richTextFromPlain(q.answer) })),
    });
  },
  cta(ctx: Ctx): SectionInstance {
    const k = c(ctx).cta;
    return registry.create('cta', {
      variant: 'banner',
      eyebrow: k.eyebrow,
      heading: k.heading,
      description: k.description,
      primaryCta: button(k.label, contactLink(ctx)),
      secondaryCta:
        phoneLink(ctx) && !ctx.anchors.form ? button('Call us', phoneLink(ctx), 'outline') : null,
      theme: 'brand',
      spacing: 'large',
    });
  },
  team(ctx: Ctx): SectionInstance | null {
    const t = c(ctx).team;
    if (!t.length) return null;
    return registry.create('team', {
      variant: 'grid',
      eyebrow: 'Team',
      heading: `The people behind ${ctx.details.name}`,
      description: '',
      align: 'center',
      members: t.map((m) => ({ name: m.name, role: m.role, bio: m.bio, image: null, link: null })),
    });
  },
  hours(ctx: Ctx): SectionInstance | null {
    const h = c(ctx).hours;
    if (!h.length) return null;
    return registry.create('business-hours', {
      variant: 'table',
      eyebrow: '',
      heading: 'Opening hours',
      description: '',
      align: 'left',
      rows: h.map((r) => ({ day: r.day, open: r.open, close: r.close, closed: r.closed ?? false })),
      note: '',
      theme: 'surface',
    });
  },
  locations(ctx: Ctx): SectionInstance | null {
    const d = ctx.details;
    if (!d.street && !d.city) return null;
    const hoursSummary = c(ctx).hours[0]
      ? `${c(ctx).hours[0]?.day} ${c(ctx).hours[0]?.open}–${c(ctx).hours[0]?.close}`
      : '';
    return registry.create('locations', {
      variant: 'single',
      eyebrow: 'Find us',
      heading: `Visit ${d.name}`,
      description: '',
      align: 'left',
      items: [
        {
          name: d.name,
          address: [d.street, d.city].filter(Boolean).join('\n'),
          phone: d.phone,
          email: d.email,
          hours: hoursSummary,
          mapUrl: `https://maps.google.com/?q=${encodeURIComponent([d.name, d.street, d.city].filter(Boolean).join(', '))}`,
          image: img(ctx, 2),
        },
      ],
    });
  },
  menu(ctx: Ctx): SectionInstance | null {
    const m = c(ctx).menu;
    if (!m?.length) return null;
    return registry.create('menu', {
      variant: 'columns',
      eyebrow: 'Menu',
      heading: 'What’s on',
      description: '',
      align: 'center',
      groups: m.map((g) => ({
        title: g.title,
        items: g.items.map((i) => ({
          name: i.name,
          description: i.description,
          price: i.price,
          tags: i.tags ?? '',
        })),
      })),
      note: 'Prices in IDR. Ask us about allergens.',
      theme: 'surface',
    });
  },
  pricing(ctx: Ctx): SectionInstance | null {
    const p = c(ctx).pricing;
    if (!p?.length) return null;
    return registry.create('pricing', {
      variant: 'cards',
      eyebrow: 'Pricing',
      heading: 'Simple, honest prices',
      description: '',
      align: 'center',
      plans: p.map((pl) => ({
        name: pl.name,
        price: pl.price,
        period: pl.period,
        description: pl.description,
        features: pl.features,
        cta: button(`Choose ${pl.name}`, contactLink(ctx), pl.highlighted ? 'filled' : 'outline'),
        highlighted: pl.highlighted ?? false,
        badge: pl.badge ?? '',
      })),
    });
  },
  portfolio(ctx: Ctx): SectionInstance | null {
    const p = c(ctx).portfolio;
    if (!p?.length) return null;
    return registry.create('portfolio', {
      variant: 'grid',
      eyebrow: 'Work',
      heading: 'Selected projects',
      description: '',
      align: 'left',
      items: p.map((it, i) => ({
        title: it.title,
        category: it.category,
        image: img(ctx, i + 1),
        link: null,
      })),
    });
  },
  gallery(ctx: Ctx): SectionInstance {
    return registry.create('gallery', {
      variant: 'grid',
      eyebrow: '',
      heading: 'A look inside',
      description: '',
      align: 'left',
      items: ctx.images.slice(0, 4).map((image) => ({ image, caption: '' })),
      columns: '2',
    });
  },
  contactForm(
    ctx: Ctx,
    template: FormTemplateId = 'contact',
    o: { heading?: string; description?: string; variant?: 'split' | 'stacked' | 'card' } = {},
  ): SectionInstance {
    const d = ctx.details;
    const asideParts = [
      d.phone ? `Prefer to talk? Call ${d.phone}.` : '',
      d.email ? `Email ${d.email}.` : '',
      d.street ? `Or visit us at ${[d.street, d.city].filter(Boolean).join(', ')}.` : '',
    ].filter(Boolean);
    const section = registry.create('contact-form', {
      variant: o.variant ?? 'split',
      eyebrow: 'Contact',
      heading: o.heading ?? 'Tell us what you need',
      description: o.description ?? 'We reply within one business day.',
      align: 'left',
      formId: ctx.formIds[template] ?? ctx.formIds.contact ?? null,
      form: null,
      aside: asideParts.join(' '),
    });
    ctx.anchors.form = section.id;
    return section;
  },
  careers(ctx: Ctx): SectionInstance {
    const k = c(ctx).careers;
    return registry.create('feature-grid', {
      variant: 'three-column',
      eyebrow: 'Careers',
      heading: k?.heading ?? `Work with ${ctx.details.name}`,
      description: k?.description ?? 'We hire for attitude and train for skill.',
      align: 'center',
      items: (
        k?.perks ?? [
          {
            icon: 'heart',
            title: 'A team that has your back',
            description: 'Small crew, real mentoring, no politics.',
          },
          {
            icon: 'trending-up',
            title: 'Room to grow',
            description: 'Paths into senior roles as we expand.',
          },
          {
            icon: 'clock',
            title: 'Predictable hours',
            description: 'Schedules published two weeks ahead.',
          },
        ]
      ).map((p) => ({
        icon: p.icon,
        title: p.title,
        description: p.description,
        link: null,
        linkLabel: '',
      })),
    });
  },
  event(ctx: Ctx): SectionInstance {
    return registry.create('rich-text', {
      variant: 'narrow',
      body: richTextFromPlain(
        `What to expect\n\nDoors open 30 minutes before we start. Seats are first come, first served.\n\nGetting there\n\n${[ctx.details.street, ctx.details.city].filter(Boolean).join(', ') || 'Address to be announced.'}\n\nQuestions? ${ctx.details.email || ctx.details.phone || 'Send us a message below.'}`,
      ),
    });
  },
};

// ---- recipes -----------------------------------------------------------------------------------------
export type Recipe = {
  id: RecipeId;
  label: string;
  description: string;
  build: (ctx: Ctx) => Array<SectionInstance | null>;
};

const homeBuilders: Record<string, (ctx: Ctx) => SectionInstance | null> = {
  hero: (ctx) => b.hero(ctx, { variant: 'split', height: 'standard' }),
  'feature-grid': (ctx) => b.features(ctx),
  services: (ctx) => b.services(ctx),
  process: (ctx) => b.process(ctx),
  stats: (ctx) => b.stats(ctx),
  testimonials: (ctx) => b.testimonials(ctx),
  faq: (ctx) => b.faq(ctx),
  cta: (ctx) => b.cta(ctx),
  'image-text': (ctx) => b.about(ctx),
  team: (ctx) => b.team(ctx),
  'business-hours': (ctx) => b.hours(ctx),
  locations: (ctx) => b.locations(ctx),
  menu: (ctx) => b.menu(ctx),
  pricing: (ctx) => b.pricing(ctx),
  portfolio: (ctx) => b.portfolio(ctx),
  gallery: (ctx) => b.gallery(ctx),
  'contact-form': (ctx) => b.contactForm(ctx),
};

export const recipes: Recipe[] = [
  {
    id: 'home',
    label: 'Home page',
    description:
      'The front door: what you do, proof, and how to get in touch, laid out for this kind of business.',
    build: (ctx) => ctx.pack.homeSections.map((t) => homeBuilders[t]?.(ctx) ?? null),
  },
  {
    id: 'generate-leads',
    label: 'Generate leads',
    description: 'Explain the problem you solve, prove it, and end with a form.',
    build: (ctx) =>
      [
        b.contactForm(ctx, 'quote', {
          heading: 'Get a quote',
          description: 'Tell us a little and we will come back with a clear price.',
        }),
        b.hero(ctx, { height: 'standard' }),
        b.features(ctx, { eyebrow: 'Benefits' }),
        b.process(ctx),
        b.testimonials(ctx),
        b.stats(ctx),
        b.faq(ctx),
      ].sort(orderFormLast),
  },
  {
    id: 'sell-service',
    label: 'Sell a service',
    description: 'One offering explained end to end, with proof and a call to action.',
    build: (ctx) => [
      b.hero(ctx, { variant: 'editorial', withMedia: true }),
      b.services(ctx, 'list'),
      b.features(ctx, { heading: 'What you get', eyebrow: 'Included' }),
      b.testimonials(ctx),
      b.cta(ctx),
    ],
  },
  {
    id: 'explain-pricing',
    label: 'Explain pricing',
    description: 'Plans side by side, common questions, and a next step.',
    build: (ctx) => [
      b.hero(ctx, {
        variant: 'centered',
        height: 'compact',
        withMedia: false,
        heading: 'Pricing',
        description: 'Straightforward options. No surprises on the invoice.',
      }),
      b.pricing(ctx) ?? b.services(ctx, 'list'),
      b.faq(ctx),
      b.cta(ctx),
    ],
  },
  {
    id: 'show-portfolio',
    label: 'Show portfolio',
    description: 'Your best work, big, with a little context.',
    build: (ctx) => [
      b.hero(ctx, {
        variant: 'centered',
        height: 'compact',
        withMedia: false,
        heading: 'Our work',
        description: 'A selection of recent projects.',
      }),
      b.portfolio(ctx) ?? b.gallery(ctx),
      b.testimonials(ctx),
      b.cta(ctx),
    ],
  },
  {
    id: 'build-trust',
    label: 'Build trust / About',
    description: 'Your story, the people, the numbers, and what customers say.',
    build: (ctx) => [
      b.hero(ctx, {
        variant: 'centered',
        height: 'compact',
        withMedia: false,
        heading: `About ${ctx.details.name}`,
        description: c(ctx).about.body.split('\n')[0] ?? '',
      }),
      b.about(ctx),
      b.stats(ctx),
      b.team(ctx),
      b.testimonials(ctx),
      b.cta(ctx),
    ],
  },
  {
    id: 'collect-bookings',
    label: 'Collect bookings',
    description: 'Hours, a booking form, and where to find you.',
    build: (ctx) =>
      [
        b.contactForm(ctx, 'booking', {
          heading: 'Request a booking',
          description: 'Tell us when you would like to come and we will confirm by phone or email.',
          variant: 'split',
        }),
        b.hero(ctx, {
          height: 'compact',
          withMedia: false,
          heading: 'Book a visit',
          description: c(ctx).hero.description,
        }),
        b.hours(ctx),
        b.locations(ctx),
        b.faq(ctx),
      ].sort(orderFormAfterHero),
  },
  {
    id: 'promote-event',
    label: 'Promote an event',
    description: 'Date, place and details, then a way to sign up.',
    build: (ctx) =>
      [
        b.contactForm(ctx, 'newsletter', {
          heading: 'Save your seat',
          description: 'Leave your email and we will send the details.',
          variant: 'card',
        }),
        b.hero(ctx, {
          variant: 'background',
          height: 'large',
          heading: 'An evening with us',
          description: 'Join us for an evening of good company. Details below.',
          eyebrow: 'Event',
        }),
        b.event(ctx),
      ].sort(orderFormLast),
  },
  {
    id: 'show-menu',
    label: 'Show menu',
    description: 'The menu, opening hours and a way to book.',
    build: (ctx) => [
      b.hero(ctx, {
        variant: 'centered',
        height: 'compact',
        withMedia: false,
        heading: 'Menu',
        description: 'Made fresh, changes with the season.',
      }),
      b.menu(ctx) ?? b.services(ctx, 'list'),
      b.hours(ctx),
      b.cta(ctx),
    ],
  },
  {
    id: 'recruit',
    label: 'Recruit employees',
    description: 'Why work here, who you will work with, and an application form.',
    build: (ctx) =>
      [
        b.contactForm(ctx, 'job', {
          heading: 'Apply',
          description: 'Tell us about yourself. We reply to every application.',
          variant: 'card',
        }),
        b.hero(ctx, {
          height: 'compact',
          withMedia: false,
          heading: `Join ${ctx.details.name}`,
          description:
            c(ctx).careers?.description ??
            'We are a small team that takes pride in the work and looks after each other.',
          eyebrow: 'Careers',
        }),
        b.careers(ctx),
        b.team(ctx),
      ].sort(orderFormLast),
  },
  {
    id: 'contact',
    label: 'Contact',
    description: 'A form, your details, hours and directions.',
    build: (ctx) =>
      [
        b.contactForm(ctx, 'contact'),
        b.hero(ctx, {
          variant: 'centered',
          height: 'compact',
          withMedia: false,
          heading: 'Get in touch',
          description: 'Questions, quotes or just to say hello.',
          eyebrow: 'Contact',
        }),
        b.locations(ctx),
        b.hours(ctx),
        b.faq(ctx),
      ].sort(orderFormAfterHero),
  },
  {
    id: 'gallery',
    label: 'Gallery',
    description: 'Photos, with room for captions.',
    build: (ctx) => [
      b.hero(ctx, {
        variant: 'centered',
        height: 'compact',
        withMedia: false,
        heading: 'Gallery',
        description: 'A look around.',
      }),
      b.gallery(ctx),
      b.cta(ctx),
    ],
  },
  {
    id: 'blank',
    label: 'Blank page',
    description: 'Start from nothing and add sections yourself.',
    build: () => [],
  },
];

/** Forms are built first so heroes/CTAs can anchor to them, then moved into place. */
function orderFormLast(a: SectionInstance | null, z: SectionInstance | null) {
  return (a?.type === 'contact-form' ? 1 : 0) - (z?.type === 'contact-form' ? 1 : 0);
}
function orderFormAfterHero(a: SectionInstance | null, z: SectionInstance | null) {
  const rank = (s: SectionInstance | null) =>
    s?.type === 'hero' ? 0 : s?.type === 'contact-form' ? 1 : 2;
  return rank(a) - rank(z);
}

export const recipeById = (id: RecipeId): Recipe => recipes.find((r) => r.id === id) as Recipe;

/** Build a page's sections for a recipe. Pure apart from generated section ids. */
export function buildSections(recipe: RecipeId, base: BuildContext): SectionInstance[] {
  const ctx: Ctx = { ...base, anchors: {} };
  return recipeById(recipe)
    .build(ctx)
    .filter((s): s is SectionInstance => s !== null);
}

export function buildPageDocument(
  recipe: RecipeId,
  base: BuildContext,
  page: { id: string; slug: string; title: string; description?: string },
): PageDocument {
  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    seo: { noindex: false, ...(page.description ? { description: page.description } : {}) },
    sections: buildSections(recipe, base),
  };
}
