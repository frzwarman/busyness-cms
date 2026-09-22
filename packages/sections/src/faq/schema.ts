import { z } from 'zod';
import { contentSourceSchema } from '../content/source.ts';
import { richTextDocSchema, sectionIntroFields, sectionStyleFields } from '../shared.ts';

export const faqItemSchema = z.object({
  question: z.string().min(1).max(160),
  answer: richTextDocSchema,
});
export const faqSchema = z.object({
  variant: z.enum(['accordion', 'two-column', 'plain']),
  source: contentSourceSchema.default({
    mode: 'manual',
    selection: 'all',
    tag: '',
    ids: [],
    limit: 12,
  }),
  ...sectionIntroFields,
  items: z.array(faqItemSchema).min(1).max(20),
  ...sectionStyleFields,
});
export type FaqProps = z.output<typeof faqSchema>;
