import { z } from 'zod';
import { linkSchema, sectionStyleFields } from '../shared.ts';

export const announcementBarSchema = z.object({
  variant: z.enum(['bar', 'pill']),
  text: z.string().min(1).max(160),
  linkLabel: z.string().max(40).default(''),
  link: linkSchema.nullable().default(null),
  ...sectionStyleFields,
});
export type AnnouncementBarProps = z.output<typeof announcementBarSchema>;
