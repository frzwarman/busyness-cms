import { z } from 'zod';
import { imageRefSchema, sectionStyleFields } from '../shared.ts';

export const quoteSchema = z.object({
  variant: z.enum(['plain', 'card', 'large']),
  text: z.string().min(1).max(600),
  author: z.string().max(80).default(''),
  role: z.string().max(80).default(''),
  image: imageRefSchema.nullable().default(null),
  ...sectionStyleFields,
});
export type QuoteProps = z.output<typeof quoteSchema>;
