import { z } from 'zod';
import { imageRefSchema, sectionIntroFields, sectionStyleFields } from '../shared.ts';

export const galleryItemSchema = z.object({
  image: imageRefSchema,
  caption: z.string().max(120).default(''),
});
export const gallerySchema = z.object({
  variant: z.enum(['grid', 'masonry', 'strip']),
  ...sectionIntroFields,
  items: z.array(galleryItemSchema).min(1).max(24),
  columns: z.enum(['2', '3', '4']).default('3'),
  ...sectionStyleFields,
});
export type GalleryProps = z.output<typeof gallerySchema>;
