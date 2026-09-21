import { buttonSchema } from '@siteos/schemas';
import { z } from 'zod';
import { sectionStyleFields } from '../shared.ts';

export const ctaSchema = z.object({
  variant: z.enum(['banner', 'card', 'split']),
  eyebrow: z.string().max(80).default(''),
  heading: z.string().min(1).max(160),
  description: z.string().max(400).default(''),
  primaryCta: buttonSchema.nullable().default(null),
  secondaryCta: buttonSchema.nullable().default(null),
  ...sectionStyleFields,
});
export type CtaProps = z.output<typeof ctaSchema>;
