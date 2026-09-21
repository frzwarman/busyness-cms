import {
  type ContentSource,
  createSupabaseContentSource,
  siteSlugSchema,
} from '@siteos/content-sdk';

let source: ContentSource | null = null;

/** Published-content source. Publishable key only; the RPCs it calls can never return drafts. */
export function content(): ContentSource {
  if (source) return source;
  const url = import.meta.env.SUPABASE_URL;
  const key = import.meta.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key)
    throw new Error('Renderer needs SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY (see .env.example).');
  source = createSupabaseContentSource(url, key);
  return source;
}

/**
 * Which site does this request address? In order: a platform subdomain (validated against
 * PUBLIC_PLATFORM_DOMAIN), then DEFAULT_SITE_SLUG. Path-prefixed routes (/s/:site/…) pass the slug explicitly.
 * Never trusts an arbitrary Host header.
 */
export function siteFromRequest(request: Request): string | null {
  const platform = import.meta.env.PUBLIC_PLATFORM_DOMAIN;
  if (platform) {
    const host = new URL(request.url).hostname;
    if (host.endsWith(`.${platform}`)) {
      const sub = host.slice(0, -(platform.length + 1));
      if (siteSlugSchema.safeParse(sub).success) return sub;
    }
  }
  return import.meta.env.DEFAULT_SITE_SLUG ?? null;
}

export const PUBLISHED_CACHE = 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400';

export function normalizeSlug(param: string | undefined): string {
  const s = `/${param ?? ''}`.replace(/\/+$/, '');
  return s === '' ? '/' : s;
}
