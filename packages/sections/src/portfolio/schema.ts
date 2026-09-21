import { z } from 'zod';
import { imageRefSchema, linkSchema, sectionIntroFields, sectionStyleFields } from '../shared.ts';

export const projectSchema = z.object({
  title: z.string().min(1).max(80),
  category: z.string().max(60).default(''),
  image: imageRefSchema.nullable().default(null),
  link: linkSchema.nullable().default(null),
});
export const portfolioSchema = z.object({
  variant: z.enum(['grid', 'masonry', 'large']),
  ...sectionIntroFields,
  items: z.array(projectSchema).min(1).max(12),
  ...sectionStyleFields,
});
export type PortfolioProps = z.output<typeof portfolioSchema>;
