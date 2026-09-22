import type { APIRoute } from 'astro';
import { sitemapResponse } from '../../../lib/seo-routes.ts';

export const GET: APIRoute = ({ params, request }) =>
  sitemapResponse(params.site ?? '', request.url, `/s/${params.site}`);
