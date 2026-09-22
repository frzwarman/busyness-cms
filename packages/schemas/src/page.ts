import { z } from 'zod';
import { imageRefSchema } from './image.ts';

/** Persisted envelope for one section. `props` is validated by the section's own schema. */
export const sectionInstanceSchema = z.object({
  id: z.string().regex(/^sec_[a-z0-9]{6,}$/),
  type: z.string().min(1).max(64),
  schemaVersion: z.number().int().positive(),
  hidden: z.boolean().default(false),
  /** When set, type/props are a placeholder: the page shows the global section with this id (resolved at preview/publish). */
  globalId: z.uuid().optional(),
  props: z.record(z.string(), z.unknown()),
});
export type SectionInstance = z.infer<typeof sectionInstanceSchema>;

export const slugSchema = z
  .string()
  .regex(/^\/([a-z0-9-]+(\/[a-z0-9-]+)*)?$/, 'Slug must look like / or /about or /menu/lunch');

export const pageSeoSchema = z.object({
  title: z.string().max(70).optional(),
  description: z.string().max(200).optional(),
  canonical: z.url({ protocol: /^https?$/ }).optional(),
  ogTitle: z.string().max(95).optional(),
  ogDescription: z.string().max(200).optional(),
  ogImage: imageRefSchema.nullable().optional(),
  noindex: z.boolean().default(false),
});

/** A page draft or version body. The CMS stores intent, never HTML. */
export const pageDocumentSchema = z.object({
  id: z.string().min(1),
  slug: slugSchema,
  title: z.string().min(1).max(120),
  seo: pageSeoSchema.default({ noindex: false }),
  sections: z.array(sectionInstanceSchema),
});
export type PageDocument = z.infer<typeof pageDocumentSchema>;

/** Minimal page directory used by link resolution and navigation. */
export const pageSummarySchema = z.object({
  id: z.string(),
  slug: slugSchema,
  title: z.string(),
  updatedAt: z.string().nullable().optional(),
});
export type PageSummary = z.infer<typeof pageSummarySchema>;
