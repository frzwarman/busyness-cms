import { canonicalUrl, defaultSiteSettings, type PageDocument, sitemapXml } from '@siteos/schemas';

const home: PageDocument = { id: '', slug: '/', title: '', seo: { noindex: false }, sections: [] };

import { content, PUBLISHED_CACHE } from './content.ts';

/** sitemap.xml for a site; `prefix` is the site's path prefix on this host. */
export async function sitemapResponse(
  siteSlug: string,
  requestUrl: string,
  prefix: string,
): Promise<Response> {
  const site = await content().getSite(siteSlug);
  if (!site) return new Response('Not found', { status: 404 });
  const base = canonicalUrl(home, site.settings ?? defaultSiteSettings, requestUrl, prefix).replace(
    /\/$/,
    '',
  );
  return new Response(sitemapXml(site.pages, base), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': PUBLISHED_CACHE },
  });
}

export async function robotsResponse(
  siteSlug: string | null,
  requestUrl: string,
  prefix: string,
): Promise<Response> {
  const lines = ['User-agent: *', 'Disallow: /preview', 'Disallow: /api/'];
  if (siteSlug) {
    const site = await content().getSite(siteSlug);
    if (site) {
      const base = canonicalUrl(
        home,
        site.settings ?? defaultSiteSettings,
        requestUrl,
        prefix,
      ).replace(/\/$/, '');
      lines.push(`Sitemap: ${base}/sitemap.xml`);
    }
  }
  return new Response(`${lines.join('\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': PUBLISHED_CACHE },
  });
}
