import { z } from 'zod';
import { sectionIntroFields, sectionStyleFields } from '../shared.ts';

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use 24-hour time like 09:00');
export const hoursRowSchema = z.object({
  day: z.string().min(1).max(40),
  open: time.default('09:00'),
  close: time.default('17:00'),
  closed: z.boolean().default(false),
});
export const businessHoursSchema = z.object({
  variant: z.enum(['table', 'compact']),
  ...sectionIntroFields,
  rows: z.array(hoursRowSchema).min(1).max(10),
  note: z.string().max(160).default(''),
  ...sectionStyleFields,
});
export type BusinessHoursProps = z.output<typeof businessHoursSchema>;
