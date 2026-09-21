import { buttonSchema, imageRefSchema } from '@siteos/schemas';
import { z } from 'zod';
import { sectionStyleFields } from '../shared.ts';

export const imageTextSchema = z.object({
  variant: z.enum(['image-left', 'image-right', 'stacked']),
  eyebrow: z.string().max(80).default(''),
  heading: z.string().min(1).max(160),
  /** Plain text; blank lines separate paragraphs. Rich text (Tiptap) replaces this in a v2 migration. */
  body: z.string().max(4000).default(''),
  image: imageRefSchema.nullable().default(null),
  imageRatio: z.enum(['square', 'landscape', 'portrait']).default('landscape'),
  cta: buttonSchema.nullable().default(null),
  ...sectionStyleFields,
});
export type ImageTextProps = z.output<typeof imageTextSchema>;
