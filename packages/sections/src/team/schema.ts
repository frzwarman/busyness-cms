import { z } from 'zod';
import { imageRefSchema, linkSchema, sectionIntroFields, sectionStyleFields } from '../shared.ts';

export const memberSchema = z.object({
  name: z.string().min(1).max(80),
  role: z.string().max(80).default(''),
  bio: z.string().max(300).default(''),
  image: imageRefSchema.nullable().default(null),
  link: linkSchema.nullable().default(null),
});
export const teamSchema = z.object({
  variant: z.enum(['grid', 'list']),
  ...sectionIntroFields,
  members: z.array(memberSchema).min(1).max(16),
  ...sectionStyleFields,
});
export type TeamProps = z.output<typeof teamSchema>;
