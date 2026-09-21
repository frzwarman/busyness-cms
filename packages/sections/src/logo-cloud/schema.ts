import { z } from 'zod';
import { imageRefSchema, linkSchema, sectionStyleFields } from '../shared.ts';

export const logoItemSchema = z.object({
  name: z.string().min(1).max(60),
  image: imageRefSchema.nullable().default(null),
  link: linkSchema.nullable().default(null),
});
export const logoCloudSchema = z.object({
  variant: z.enum(['row', 'grid']),
  heading: z.string().max(120).default('Trusted by'),
  logos: z.array(logoItemSchema).min(1).max(12),
  grayscale: z.boolean().default(true),
  ...sectionStyleFields,
});
export type LogoCloudProps = z.output<typeof logoCloudSchema>;
