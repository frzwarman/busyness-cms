import { z } from 'zod';
import { iconNameSchema, linkSchema, sectionIntroFields, sectionStyleFields } from '../shared.ts';

export const featureItemSchema = z.object({
  icon: iconNameSchema.nullable().default('sparkles'),
  title: z.string().min(1).max(80),
  description: z.string().max(300).default(''),
  link: linkSchema.nullable().default(null),
  linkLabel: z.string().max(40).default(''),
});
export const featureGridSchema = z.object({
  variant: z.enum(['three-column', 'two-column', 'list', 'bento']),
  ...sectionIntroFields,
  items: z.array(featureItemSchema).min(1).max(9),
  ...sectionStyleFields,
});
export type FeatureGridProps = z.output<typeof featureGridSchema>;
