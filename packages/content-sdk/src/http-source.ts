import { type ContentSource, publishedPageSchema, publishedSiteSchema } from './types.ts';

/** Consumes the renderer's JSON content API: GET /api/content/sites/:site and /api/content/sites/:site/pages/*. */
export function createHttpContentSource(
  baseUrl: string,
  fetchImpl: typeof fetch = fetch,
): ContentSource {
  const base = baseUrl.replace(/\/$/, '');
  async function get<T>(path: string, parse: (v: unknown) => T): Promise<T | null> {
    const res = await fetchImpl(`${base}${path}`, { headers: { Accept: 'application/json' } });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Content API ${res.status} for ${path}`);
    return parse(await res.json());
  }
  return {
    getSite: (siteSlug) =>
      get(`/api/content/sites/${encodeURIComponent(siteSlug)}`, (v) =>
        publishedSiteSchema.parse(v),
      ),
    getPage: (siteSlug, slug) =>
      get(
        `/api/content/sites/${encodeURIComponent(siteSlug)}/pages${slug === '/' ? '/' : slug}`,
        (v) => publishedPageSchema.parse(v),
      ),
  };
}
