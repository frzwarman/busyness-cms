import { getPreset } from '@siteos/design-system';
import { registry } from '@siteos/sections';
import { describe, expect, it } from 'vitest';
import {
  buildGlobals,
  buildSections,
  buildSitePage,
  businessPacks,
  imagesFor,
  planSite,
  recipes,
  type SiteDetails,
} from '../src/index.ts';

const details: SiteDetails = {
  name: 'Test Business',
  tagline: 'A tagline',
  phone: '+62 251 555 0100',
  email: 'hello@test.example',
  street: 'Jl. Pajajaran No. 12',
  city: 'Bogor',
};
const bare: SiteDetails = { name: 'Bare', tagline: '', phone: '', email: '', street: '', city: '' };

function fakeIds(pack: (typeof businessPacks)[number]) {
  return Object.fromEntries(pack.suggestedPages.map((p) => [p.key, crypto.randomUUID()]));
}

describe('business packs', () => {
  it('has 16 unique packs with valid presets and structured data types', () => {
    expect(businessPacks).toHaveLength(16);
    expect(new Set(businessPacks.map((p) => p.id)).size).toBe(16);
    for (const p of businessPacks) {
      expect(getPreset(p.suggestedPreset), p.id).toBeDefined();
      expect(
        p.suggestedPages.some((pg) => pg.key === 'home' && pg.slug === '/'),
        p.id,
      ).toBe(true);
      expect(new Set(p.suggestedPages.map((pg) => pg.slug)).size, p.id).toBe(
        p.suggestedPages.length,
      );
      for (const t of p.homeSections)
        expect(registry.has(t), `${p.id} home uses unknown section ${t}`).toBe(true);
      for (const pg of p.suggestedPages)
        expect(
          recipes.some((r) => r.id === pg.recipe),
          `${p.id}/${pg.key} recipe`,
        ).toBe(true);
    }
  });

  it('never ships lorem ipsum or empty copy', () => {
    const text = JSON.stringify(businessPacks).toLowerCase();
    expect(text).not.toContain('lorem');
    expect(text).not.toContain('ipsum');
    for (const p of businessPacks) {
      expect(p.content.hero.heading.length).toBeGreaterThan(10);
      expect(p.content.testimonials.length).toBeGreaterThanOrEqual(3);
      expect(p.content.faq.length).toBeGreaterThanOrEqual(3);
      expect(p.content.features).toHaveLength(3);
    }
  });

  it('every suggested page of every pack builds a document with zero validation issues', () => {
    for (const pack of businessPacks) {
      const pageIds = fakeIds(pack);
      const formIds = {
        contact: crypto.randomUUID(),
        booking: crypto.randomUUID(),
        quote: crypto.randomUUID(),
        job: crypto.randomUUID(),
        newsletter: crypto.randomUUID(),
      };
      const globals = buildGlobals(
        pack,
        details,
        pack.suggestedPages.map((p) => ({
          key: p.key,
          id: pageIds[p.key] as string,
          title: p.title,
        })),
      );
      for (const page of pack.suggestedPages) {
        const doc = buildSitePage(
          pack,
          details,
          { ...page, id: pageIds[page.key] as string },
          {
            pageIds,
            formIds,
            globals: {
              navbar: { id: crypto.randomUUID(), section: globals.navbar.section },
              footer: { id: crypto.randomUUID(), section: globals.footer.section },
            },
          },
        );
        const { issues } = registry.normalizeDocument(doc);
        expect(issues, `${pack.id}/${page.key}: ${JSON.stringify(issues)}`).toEqual([]);
        expect(doc.sections.length, `${pack.id}/${page.key} is empty`).toBeGreaterThan(2);
        expect(doc.sections[0]?.type).toBe('navbar');
        expect(doc.sections.at(-1)?.type).toBe('footer');
        // no dangling internal links: every page link points at a created page
        const json = JSON.stringify(doc);
        for (const m of json.matchAll(/"pageId":"([^"]+)"/g))
          expect(Object.values(pageIds), `${pack.id}/${page.key} link`).toContain(m[1]);
      }
    }
  });

  it('every recipe builds for every pack, with or without details and forms', () => {
    for (const pack of businessPacks) {
      for (const recipe of recipes) {
        for (const d of [details, bare]) {
          const sections = buildSections(recipe.id, {
            pack,
            details: d,
            pageIds: {},
            formIds: {},
            images: imagesFor(pack),
          });
          for (const s of sections) {
            const r = registry.validate(s);
            expect(
              r.ok,
              `${pack.id}/${recipe.id}/${s.type}: ${r.ok ? '' : r.errors.join('; ')}`,
            ).toBe(true);
          }
          if (recipe.id !== 'blank') expect(sections.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('plans a site from a pack: theme with color overrides, settings from details, forms and recommended pages', () => {
    const pack = businessPacks.find((p) => p.id === 'restaurant');
    if (!pack) throw new Error('restaurant pack missing');
    const plan = planSite(pack, details, { colors: { primary: '#123456' } });
    expect(plan.theme.colors.primary).toBe('#123456');
    expect(plan.theme.typography.headingFont).toBe('fraunces');
    expect(plan.settings.structuredData).toMatchObject({
      type: 'Restaurant',
      telephone: details.phone,
      email: details.email,
      address: { street: details.street, city: details.city },
    });
    expect(plan.forms.map((f) => f.template).sort()).toEqual(['booking', 'contact']);
    expect(plan.pages.map((p) => p.key)).toEqual(['home', 'menu', 'about', 'contact']);
    expect(
      planSite(pack, details, { pageKeys: ['home', 'gallery'] }).pages.map((p) => p.key),
    ).toEqual(['home', 'gallery']);
  });

  it('builds globals whose links only point at created pages and fall back to phone when there is no contact page', () => {
    const pack = businessPacks.find((p) => p.id === 'gym');
    if (!pack) throw new Error('gym pack missing');
    const pages = [
      { key: 'home', id: crypto.randomUUID(), title: 'Home' },
      { key: 'pricing', id: crypto.randomUUID(), title: 'Memberships' },
    ];
    const g = buildGlobals(pack, details, pages);
    const navLinks = (
      g.navbar.section.props.links as Array<{ link: { kind: string; pageId?: string } }>
    ).map((l) => l.link);
    for (const l of navLinks) expect(pages.map((p) => p.id)).toContain(l.pageId);
    expect((g.navbar.section.props.cta as { link: { kind: string } }).link.kind).toBe('phone');
    expect(
      registry.validate({
        id: 'sec_test00000001',
        type: 'navbar',
        schemaVersion: 1,
        hidden: false,
        props: g.navbar.section.props,
      }).ok,
    ).toBe(true);
    expect(
      registry.validate({
        id: 'sec_test00000002',
        type: 'footer',
        schemaVersion: 1,
        hidden: false,
        props: g.footer.section.props,
      }).ok,
    ).toBe(true);
  });
});
