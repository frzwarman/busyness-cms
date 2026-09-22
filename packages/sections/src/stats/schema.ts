import { z } from 'zod';
import { contentSourceSchema } from '../content/source.ts';
import { sectionIntroFields, sectionStyleFields } from '../shared.ts';

export const statItemSchema = z.object({
  value: z.string().min(1).max(20),
  label: z.string().min(1).max(60),
  description: z.string().max(120).default(''),
});
export const statsSchema = z.object({
  variant: z.enum(['row', 'grid', 'cards']),
  source: contentSourceSchema.default({
    mode: 'manual',
    selection: 'all',
    tag: '',
    ids: [],
    limit: 12,
  }),
  ...sectionIntroFields,
  items: z.array(statItemSchema).min(1).max(8),
  ...sectionStyleFields,
});
export type StatsProps = z.output<typeof statsSchema>;
