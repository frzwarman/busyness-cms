import { z } from 'zod';
import { contentSourceSchema } from '../content/source.ts';
import { imageRefSchema, linkSchema, sectionIntroFields, sectionStyleFields } from '../shared.ts';

export const serviceItemSchema = z.object({
  title: z.string().min(1).max(80),
  description: z.string().max(300).default(''),
  price: z.string().max(40).default(''),
  image: imageRefSchema.nullable().default(null),
  link: linkSchema.nullable().default(null),
});
export const servicesSchema = z.object({
  variant: z.enum(['cards', 'list', 'image-cards']),
  source: contentSourceSchema.default({
    mode: 'manual',
    selection: 'all',
    tag: '',
    ids: [],
    limit: 12,
  }),
  ...sectionIntroFields,
  items: z.array(serviceItemSchema).min(1).max(12),
  ...sectionStyleFields,
});
export type ServicesProps = z.output<typeof servicesSchema>;
