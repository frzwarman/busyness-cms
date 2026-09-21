import { z } from 'zod';
import { buttonSchema, imageRefSchema, richTextDocSchema, sectionStyleFields } from '../shared.ts';

export const imageTextSchema = z.object({
  variant: z.enum(['image-left', 'image-right', 'stacked']),
  eyebrow: z.string().max(80).default(''),
  heading: z.string().min(1).max(160),
  /** v2: rich text (v1 stored plain text with blank-line paragraphs; see migrations). */
  body: richTextDocSchema,
  image: imageRefSchema.nullable().default(null),
  imageRatio: z.enum(['square', 'landscape', 'portrait']).default('landscape'),
  cta: buttonSchema.nullable().default(null),
  ...sectionStyleFields,
});
export type ImageTextProps = z.output<typeof imageTextSchema>;
