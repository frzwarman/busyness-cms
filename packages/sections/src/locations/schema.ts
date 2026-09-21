import { z } from 'zod';
import { imageRefSchema, sectionIntroFields, sectionStyleFields } from '../shared.ts';

export const locationItemSchema = z.object({
  name: z.string().min(1).max(80),
  address: z.string().min(1).max(300),
  phone: z.string().max(32).default(''),
  email: z.string().max(120).default(''),
  hours: z.string().max(160).default(''),
  mapUrl: z
    .url({ protocol: /^https$/ })
    .optional()
    .nullable()
    .default(null),
  image: imageRefSchema.nullable().default(null),
});
export const locationsSchema = z.object({
  variant: z.enum(['cards', 'list', 'single']),
  ...sectionIntroFields,
  items: z.array(locationItemSchema).min(1).max(8),
  ...sectionStyleFields,
});
export type LocationsProps = z.output<typeof locationsSchema>;
