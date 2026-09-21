import { z } from 'zod';
import { sectionIntroFields, sectionStyleFields } from '../shared.ts';

export const menuItemSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(200).default(''),
  price: z.string().max(30).default(''),
  tags: z.string().max(60).default(''),
});
export const menuGroupSchema = z.object({
  title: z.string().min(1).max(80),
  items: z.array(menuItemSchema).min(1).max(30),
});
export const menuSchema = z.object({
  variant: z.enum(['columns', 'list']),
  ...sectionIntroFields,
  groups: z.array(menuGroupSchema).min(1).max(12),
  note: z.string().max(160).default(''),
  ...sectionStyleFields,
});
export type MenuProps = z.output<typeof menuSchema>;
