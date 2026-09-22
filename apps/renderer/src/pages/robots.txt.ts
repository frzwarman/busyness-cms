import type { APIRoute } from 'astro';
import { siteFromRequest } from '../lib/content.ts';
import { robotsResponse } from '../lib/seo-routes.ts';

export const GET: APIRoute = ({ request }) =>
  robotsResponse(siteFromRequest(request), request.url, '');
