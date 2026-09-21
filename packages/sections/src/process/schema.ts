import { z } from 'zod';
import { sectionIntroFields, sectionStyleFields } from '../shared.ts';

export const processStepSchema = z.object({
  title: z.string().min(1).max(80),
  description: z.string().max(300).default(''),
});
export const processSchema = z.object({
  variant: z.enum(['horizontal', 'vertical', 'cards']),
  ...sectionIntroFields,
  steps: z.array(processStepSchema).min(2).max(6),
  ...sectionStyleFields,
});
export type ProcessProps = z.output<typeof processSchema>;
