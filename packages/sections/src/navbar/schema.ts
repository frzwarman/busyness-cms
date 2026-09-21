import { z } from 'zod';
import { buttonSchema, imageRefSchema, navLinkSchema, sectionStyleFields } from '../shared.ts';

export const navbarSchema = z.object({
  variant: z.enum(['simple', 'centered', 'split']),
  brandName: z.string().min(1).max(60),
  logo: imageRefSchema.nullable().default(null),
  links: z.array(navLinkSchema).max(8).default([]),
  cta: buttonSchema.nullable().default(null),
  sticky: z.boolean().default(false),
  ...sectionStyleFields,
});
export type NavbarProps = z.output<typeof navbarSchema>;
