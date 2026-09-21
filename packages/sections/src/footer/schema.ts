import { z } from 'zod';
import { navLinkSchema, sectionStyleFields } from '../shared.ts';

export const footerColumnSchema = z.object({
  title: z.string().max(60).default(''),
  links: z.array(navLinkSchema).max(10).default([]),
});
export const footerSchema = z.object({
  variant: z.enum(['simple', 'columns', 'centered']),
  brandName: z.string().min(1).max(60),
  tagline: z.string().max(160).default(''),
  columns: z.array(footerColumnSchema).max(4).default([]),
  copyright: z.string().max(120).default(''),
  legalLinks: z.array(navLinkSchema).max(6).default([]),
  ...sectionStyleFields,
});
export type FooterProps = z.output<typeof footerSchema>;
