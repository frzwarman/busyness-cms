import { createClient } from '@supabase/supabase-js';
import {
  type ContentSource,
  publishedPageSchema,
  publishedSiteSchema,
  siteSlugSchema,
} from './types.ts';

/**
 * Reads published content through two anon-callable, security-definer RPCs. Works with the publishable
 * key; no table is exposed and drafts are unreachable by construction.
 */
export function createSupabaseContentSource(url: string, publishableKey: string): ContentSource {
  const db = createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return {
    async getSite(siteSlug) {
      if (!siteSlugSchema.safeParse(siteSlug).success) return null;
      const { data, error } = await db.rpc('get_published_site', { p_site_slug: siteSlug });
      if (error) throw new Error(`Content: ${error.message}`);
      if (data === null) return null;
      return publishedSiteSchema.parse(data);
    },
    async getPage(siteSlug, slug) {
      if (!siteSlugSchema.safeParse(siteSlug).success) return null;
      const { data, error } = await db.rpc('get_published_page', {
        p_site_slug: siteSlug,
        p_slug: slug,
      });
      if (error) throw new Error(`Content: ${error.message}`);
      if (data === null) return null;
      return publishedPageSchema.parse(data);
    },
  };
}
