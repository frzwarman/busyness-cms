import { describe, expect, it } from 'vitest';
import {
  buildJsonLd,
  canonicalUrl,
  defaultSiteSettings,
  type PageDocument,
  sitemapXml,
} from '../src/index.ts';

const page: PageDocument = {
  id: 'p',
  slug: '/menu',
  title: 'Menu',
  seo: { noindex: false },
  sections: [],
};

describe('seo helpers', () => {
  it('emits no structured data unless a type is chosen, and never invents fields', () => {
    expect(
      buildJsonLd({
        site: { name: 'Kopi', settings: defaultSiteSettings },
        page,
        url: 'https://k.io/menu',
        siteUrl: 'https://k.io',
      }),
    ).toBeNull();
    const settings = {
      ...defaultSiteSettings,
      structuredData: {
        ...defaultSiteSettings.structuredData,
        type: 'Restaurant' as const,
        telephone: '+62 251 555 0100',
      },
    };
    const ld = buildJsonLd({
      site: { name: 'Kopi', settings },
      page,
      url: 'https://k.io/menu',
      siteUrl: 'https://k.io',
    }) as { '@graph': Record<string, unknown>[] };
    const org = ld['@graph'][0] as Record<string, unknown>;
    expect(org['@type']).toBe('Restaurant');
    expect(org.telephone).toBe('+62 251 555 0100');
    expect(org).not.toHaveProperty('address');
    expect(org).not.toHaveProperty('openingHours');
    expect(org).not.toHaveProperty('aggregateRating');
  });
  it('canonical prefers the page override, then the configured base, then the request', () => {
    expect(
      canonicalUrl(page, defaultSiteSettings, 'http://localhost:4321/s/kopi/menu', '/s/kopi'),
    ).toBe('http://localhost:4321/s/kopi/menu');
    expect(
      canonicalUrl(
        page,
        { ...defaultSiteSettings, canonicalBase: 'https://kopisudut.com/' },
        'http://x/',
        '/s/kopi',
      ),
    ).toBe('https://kopisudut.com/menu');
    expect(
      canonicalUrl(
        { ...page, seo: { noindex: false, canonical: 'https://other.example/m' } },
        defaultSiteSettings,
        'http://x/',
      ),
    ).toBe('https://other.example/m');
  });
  it('writes a valid sitemap', () => {
    const xml = sitemapXml(
      [
        { id: 'a', slug: '/', title: 'Home', updatedAt: '2026-09-22T00:00:00Z' },
        { id: 'b', slug: '/menu', title: 'Menu' },
      ],
      'https://k.io',
    );
    expect(xml).toContain('<loc>https://k.io/</loc><lastmod>2026-09-22T00:00:00.000Z</lastmod>');
    expect(xml).toContain('<loc>https://k.io/menu</loc>');
  });
});
