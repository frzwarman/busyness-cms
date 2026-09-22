import { EDGE_ORIGIN } from '@/lib/assets/upload';
import { PREVIEW_ORIGIN } from '@/lib/preview-bridge';
import { supabase } from '@/lib/supabase';

/** Ask the edge worker to purge published URLs. A no-op (with a reason) when the worker has no zone credentials. */
export async function purgePublished(
  siteId: string,
  siteSlug: string,
  slug: string,
): Promise<{ purged: boolean; reason?: string }> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return { purged: false, reason: 'not-signed-in' };
  const base = `${PREVIEW_ORIGIN}/s/${siteSlug}`;
  const urls = [
    `${base}${slug === '/' ? '/' : slug}`,
    `${base}/sitemap.xml`,
    `${PREVIEW_ORIGIN}/api/content/sites/${siteSlug}`,
    `${PREVIEW_ORIGIN}/api/content/sites/${siteSlug}/pages${slug === '/' ? '/' : slug}`,
  ];
  try {
    const res = await fetch(`${EDGE_ORIGIN}/cache/purge`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${data.session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ siteId, urls }),
    });
    const body = (await res.json().catch(() => ({}))) as {
      purged?: boolean;
      reason?: string;
      error?: string;
    };
    return { purged: Boolean(body.purged), reason: body.reason ?? body.error };
  } catch (e) {
    return { purged: false, reason: e instanceof Error ? e.message : 'unreachable' };
  }
}
