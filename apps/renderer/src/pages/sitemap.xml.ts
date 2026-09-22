import type { APIRoute } from 'astro';
import { siteFromRequest } from '../lib/content.ts';
import { sitemapResponse } from '../lib/seo-routes.ts';

export const GET: APIRoute = ({ request }) => {
  const site = siteFromRequest(request);
  return site
    ? sitemapResponse(site, request.url, '')
    : Promise.resolve(new Response('Not found', { status: 404 }));
};
