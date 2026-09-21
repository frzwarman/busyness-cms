import { z } from 'zod';
import { imageRefSchema, sectionIntroFields, sectionStyleFields } from '../shared.ts';

export const testimonialItemSchema = z.object({
  quote: z.string().min(1).max(600),
  name: z.string().min(1).max(80),
  role: z.string().max(80).default(''),
  image: imageRefSchema.nullable().default(null),
  rating: z.number().int().min(0).max(5).default(5),
});
export const testimonialsSchema = z.object({
  variant: z.enum(['grid', 'columns', 'single']),
  ...sectionIntroFields,
  items: z.array(testimonialItemSchema).min(1).max(9),
  showRatings: z.boolean().default(true),
  ...sectionStyleFields,
});
export type TestimonialsProps = z.output<typeof testimonialsSchema>;
