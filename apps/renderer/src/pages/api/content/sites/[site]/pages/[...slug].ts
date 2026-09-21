import type { APIRoute } from 'astro';
import { content, normalizeSlug } from '../../../../../../lib/content.ts';
import { conditional, json } from '../index.ts';

export const GET: APIRoute = async ({ params, request }) => {
  const page = await content().getPage(params.site ?? '', normalizeSlug(params.slug));
  if (!page) return json({ error: 'Not found' }, 404);
  return conditional(request, JSON.stringify(page), `"${page.versionId}"`);
};
