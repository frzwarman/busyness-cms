import type { PageDocument, PageSummary } from './page.ts';
import type { SiteSettings, StructuredData } from './site.ts';

/**
 * JSON-LD from configured facts only: nothing is invented (no fabricated ratings, addresses or hours).
 * Returns null when the site has not chosen a structured-data type.
 */
export function buildJsonLd(input: {
  site: { name: string; settings: SiteSettings };
  page: PageDocument;
  url: string;
  siteUrl: string;
}): Record<string, unknown> | null {
  const sd: StructuredData = input.site.settings.structuredData;
  if (sd.type === 'none') return null;
  const org: Record<string, unknown> = {
    '@type': sd.type,
    name: sd.legalName || input.site.name,
    url: input.siteUrl,
  };
  if (input.site.settings.description) org.description = input.site.settings.description;
  if (input.site.settings.logo?.src)
    org.logo = absolute(input.site.settings.logo.src, input.siteUrl);
  if (input.site.settings.ogImage?.src)
    org.image = absolute(input.site.settings.ogImage.src, input.siteUrl);
  if (sd.telephone) org.telephone = sd.telephone;
  if (sd.email) org.email = sd.email;
  if (sd.priceRange && sd.type !== 'Organization') org.priceRange = sd.priceRange;
  const a = sd.address;
  if (a.street || a.city || a.postalCode) {
    org.address = {
      '@type': 'PostalAddress',
      ...(a.street ? { streetAddress: a.street } : {}),
      ...(a.city ? { addressLocality: a.city } : {}),
      ...(a.region ? { addressRegion: a.region } : {}),
      ...(a.postalCode ? { postalCode: a.postalCode } : {}),
      ...(a.country ? { addressCountry: a.country } : {}),
    };
  }
  if (sd.openingHours.length && sd.type !== 'Organization') org.openingHours = sd.openingHours;
  if (sd.sameAs.length) org.sameAs = sd.sameAs;
  const webPage: Record<string, unknown> = {
    '@type': 'WebPage',
    url: input.url,
    name: input.page.seo.title ?? input.page.title,
    ...((input.page.seo.description ?? input.site.settings.description)
      ? { description: input.page.seo.description ?? input.site.settings.description }
      : {}),
    isPartOf: { '@type': 'WebSite', url: input.siteUrl, name: input.site.name },
  };
  return { '@context': 'https://schema.org', '@graph': [org, webPage] };
}

export function absolute(src: string, base: string): string {
  try {
    return new URL(src, base).toString();
  } catch {
    return src;
  }
}

/** Resolve the page's canonical URL from settings (preferred) or the request origin. */
export function canonicalUrl(
  page: PageDocument,
  settings: SiteSettings,
  requestUrl: string,
  sitePrefix = '',
): string {
  if (page.seo.canonical) return page.seo.canonical;
  const base = settings.canonicalBase.trim().replace(/\/$/, '');
  if (base && /^https?:\/\//.test(base)) return `${base}${page.slug === '/' ? '/' : page.slug}`;
  const u = new URL(requestUrl);
  return `${u.origin}${sitePrefix}${page.slug === '/' ? (sitePrefix ? '/' : '/') : page.slug}`
    .replace(/\/{2,}/g, '/')
    .replace(':/', '://');
}

export function sitemapXml(pages: PageSummary[], base: string): string {
  const urls = pages
    .map(
      (p) =>
        `  <url><loc>${escapeXml(`${base}${p.slug === '/' ? '/' : p.slug}`)}</loc>${p.updatedAt ? `<lastmod>${new Date(p.updatedAt).toISOString()}</lastmod>` : ''}</url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
