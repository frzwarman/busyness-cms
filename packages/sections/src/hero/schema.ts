import { buttonSchema, imageRefSchema } from '@siteos/schemas';
import { z } from 'zod';
import { sectionStyleFields } from '../shared.ts';

export const heroVariantValues = ['split', 'centered', 'background', 'editorial'] as const;

export const heroSchema = z.object({
  variant: z.enum(heroVariantValues),
  eyebrow: z.string().max(80).default(''),
  heading: z.string().min(1).max(160),
  description: z.string().max(600).default(''),
  alignment: z.enum(['left', 'center']).default('left'),
  height: z.enum(['compact', 'standard', 'large', 'full']).default('standard'),
  mediaPosition: z.enum(['left', 'right']).default('right'),
  media: imageRefSchema.nullable().default(null),
  primaryCta: buttonSchema.nullable().default(null),
  secondaryCta: buttonSchema.nullable().default(null),
  ...sectionStyleFields,
});
export type HeroProps = z.output<typeof heroSchema>;
