import { defaultSiteSettings, type PageDocument } from '@siteos/schemas';
import { registry } from '@siteos/sections';
import { demoAboutPage, demoHomePage, demoTheme } from '@siteos/sections/fixtures';
import { describe, expect, it } from 'vitest';
import { formatKb, runHealthChecks } from '../src/index.ts';

const summary = (d: PageDocument) => ({ id: d.id, slug: d.slug, title: d.title });
const settingsOk = {
  ...defaultSiteSettings,
  description: 'Coffee in Bogor',
  logo: { src: '/l.png', alt: 'Logo', decorative: false, focalX: 0.5, focalY: 0.5 },
  favicon: { src: '/f.png', alt: '', decorative: true, focalX: 0.5, focalY: 0.5 },
  ogImage: { src: '/o.png', alt: 'Cafe', decorative: false, focalX: 0.5, focalY: 0.5 },
  structuredData: {
    ...defaultSiteSettings.structuredData,
    type: 'Restaurant' as const,
    telephone: '+62',
  },
};

describe('website health', () => {
  it('reports a clean demo page as excellent across categories', () => {
    const r = runHealthChecks({
      pages: [
        { summary: summary(demoHomePage), document: demoHomePage },
        { summary: summary(demoAboutPage), document: demoAboutPage },
      ],
      settings: settingsOk,
      theme: demoTheme,
      registry,
    });
    expect(r.issues.filter((i) => i.severity === 'error')).toEqual([]);
    expect(r.categories.accessibility.status).toBe('excellent');
    expect(r.categories.seo.status).toBe('excellent');
    expect(r.checkedPages).toBe(2);
    // Links to the about page resolve; the same page alone would report broken links.
    const alone = runHealthChecks({
      pages: [{ summary: summary(demoHomePage), document: demoHomePage }],
      settings: settingsOk,
      theme: demoTheme,
      registry,
    });
    expect(
      alone.issues.filter((i) => i.id.startsWith('content.broken-link')).length,
    ).toBeGreaterThan(0);
  });

  it('finds missing alt text, broken links, empty CTAs, placeholder copy and missing brand assets', () => {
    const doc = structuredClone(demoHomePage);
    const hero = doc.sections[0] as PageDocument['sections'][number];
    (hero.props.media as { alt: string }).alt = '';
    (hero.props.primaryCta as { link: unknown }).link = { kind: 'page', pageId: 'missing-page' };
    const cta = doc.sections[2] as PageDocument['sections'][number];
    cta.props.primaryCta = null;
    cta.props.secondaryCta = null;
    cta.props.heading = 'Replace this with your own heading';
    const r = runHealthChecks({
      pages: [{ summary: summary(doc), document: doc }],
      settings: defaultSiteSettings,
      theme: demoTheme,
      registry,
    });
    const ids = r.issues.map((i) => i.id);
    expect(ids).toContain(`a11y.alt.${doc.id}.${hero.id}.media`);
    expect(ids).toContain(`content.broken-link.${doc.id}.${hero.id}.primaryCta`);
    expect(ids).toContain(`content.empty-cta.${doc.id}.${cta.id}`);
    expect(ids).toContain(`content.placeholder.${doc.id}.${cta.id}`);
    expect(ids).toEqual(
      expect.arrayContaining([
        'brand.logo',
        'brand.favicon',
        'seo.site-description',
        'content.contact',
      ]),
    );
    expect(r.categories.accessibility.status).toBe('needs-attention');
    expect(r.categories.content.status).toBe('needs-attention');
    const alt = r.issues.find((i) => i.id.startsWith('a11y.alt'));
    expect(alt?.target).toMatchObject({
      kind: 'page',
      pageId: doc.id,
      sectionId: hero.id,
      fieldPath: 'media',
    });
  });

  it('flags heading structure and duplicate titles', () => {
    const a = structuredClone(demoHomePage);
    const b: PageDocument = {
      ...structuredClone(demoHomePage),
      id: 'p2',
      slug: '/two',
      title: 'Home',
      sections: [
        structuredClone(demoHomePage.sections[0] as PageDocument['sections'][number]),
        {
          ...structuredClone(demoHomePage.sections[0] as PageDocument['sections'][number]),
          id: 'sec_second000001',
        },
      ],
    };
    const r = runHealthChecks({
      pages: [
        { summary: summary(a), document: a },
        { summary: summary(b), document: b },
      ],
      settings: settingsOk,
      theme: demoTheme,
      registry,
    });
    expect(r.issues.some((i) => i.id === 'a11y.h1.p2')).toBe(true);
    expect(r.issues.some((i) => i.id === 'seo.title-dup.p2')).toBe(true);
  });

  it('formats bytes', () => {
    expect(formatKb(512)).toBe('512 B');
    expect(formatKb(842 * 1024)).toBe('842 KB');
    expect(formatKb(1.5 * 1024 * 1024)).toBe('1.5 MB');
  });
});
