import type { APIRoute } from 'astro';
import { content, PUBLISHED_CACHE } from '../../../../../lib/content.ts';

export const GET: APIRoute = async ({ params, request }) => {
  const site = await content().getSite(params.site ?? '');
  if (!site) return json({ error: 'Not found' }, 404);
  return conditional(request, JSON.stringify(site), `W/"site-${site.id}-${site.pages.length}"`);
};

export function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

/** Published payloads are cacheable; a matching If-None-Match short-circuits with 304. */
export function conditional(request: Request, body: string, etag: string) {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': PUBLISHED_CACHE,
    ETag: etag,
    Vary: 'Accept',
  };
  if (request.headers.get('If-None-Match') === etag)
    return new Response(null, { status: 304, headers });
  return new Response(body, { status: 200, headers });
}
