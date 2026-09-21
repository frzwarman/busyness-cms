import { z } from 'zod';
import { buttonSchema, sectionIntroFields, sectionStyleFields } from '../shared.ts';

export const planSchema = z.object({
  name: z.string().min(1).max(60),
  price: z.string().min(1).max(30),
  period: z.string().max(30).default(''),
  description: z.string().max(200).default(''),
  features: z.array(z.string().min(1).max(80)).max(12).default([]),
  cta: buttonSchema.nullable().default(null),
  highlighted: z.boolean().default(false),
  badge: z.string().max(24).default(''),
});
export const pricingSchema = z.object({
  variant: z.enum(['cards', 'compact']),
  ...sectionIntroFields,
  plans: z.array(planSchema).min(1).max(4),
  ...sectionStyleFields,
});
export type PricingProps = z.output<typeof pricingSchema>;
