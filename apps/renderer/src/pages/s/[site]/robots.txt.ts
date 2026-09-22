import type { APIRoute } from 'astro';
import { robotsResponse } from '../../../lib/seo-routes.ts';

export const GET: APIRoute = ({ params, request }) =>
  robotsResponse(params.site ?? '', request.url, `/s/${params.site}`);
