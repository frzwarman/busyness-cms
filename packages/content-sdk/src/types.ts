import { pageDocumentSchema, pageSummarySchema, themeTokensSchema } from '@siteos/schemas';
import { z } from 'zod';

/** Published-only shapes. Nothing here can carry draft data. */
export const publishedSiteSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  theme: themeTokensSchema,
  pages: z.array(pageSummarySchema),
});
export type PublishedSite = z.infer<typeof publishedSiteSchema>;

export const publishedPageSchema = z.object({
  versionId: z.string(),
  versionNumber: z.number().int(),
  publishedAt: z.string().nullable(),
  page: pageDocumentSchema,
  site: publishedSiteSchema,
});
export type PublishedPage = z.infer<typeof publishedPageSchema>;

/** One interface, two transports: direct Supabase RPC (renderer, API routes) or HTTP (external consumers). */
export interface ContentSource {
  getSite(siteSlug: string): Promise<PublishedSite | null>;
  getPage(siteSlug: string, slug: string): Promise<PublishedPage | null>;
}

export const siteSlugSchema = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  .max(63);
