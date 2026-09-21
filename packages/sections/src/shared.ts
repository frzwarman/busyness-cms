import {
  buttonSchema,
  imageRefSchema,
  linkSchema,
  sectionSpacingSchema,
  sectionThemeSchema,
} from '@siteos/schemas';
import { z } from 'zod';
import { iconNames } from './primitives/icons.ts';
import { richTextDocSchema } from './rich-text/schema.ts';

/** Style fields every themable section carries. Kept out of section inspectors: Studio renders them from capabilities. */
export const sectionStyleFields = {
  theme: sectionThemeSchema.default('light'),
  spacing: sectionSpacingSchema.default('standard'),
};

/** Eyebrow / heading / description intro shared by most list-like sections. */
export const sectionIntroFields = {
  eyebrow: z.string().max(80).default(''),
  heading: z.string().max(160).default(''),
  description: z.string().max(600).default(''),
  align: z.enum(['left', 'center']).default('left'),
};

export const alignmentOptions = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
];

export const iconNameSchema = z.enum(iconNames);
export const navLinkSchema = z.object({ label: z.string().min(1).max(60), link: linkSchema });
export type NavLink = z.infer<typeof navLinkSchema>;

export { buttonSchema, imageRefSchema, linkSchema, richTextDocSchema };

/** Inspector fields for the shared intro block. */
export const introInspectorGroup = {
  id: 'intro',
  label: 'Heading',
  fields: [
    { path: 'eyebrow', label: 'Eyebrow', control: 'text' as const, maxLength: 80 },
    { path: 'heading', label: 'Heading', control: 'textarea' as const, rows: 2, maxLength: 160 },
    {
      path: 'description',
      label: 'Description',
      control: 'textarea' as const,
      rows: 3,
      maxLength: 600,
    },
    { path: 'align', label: 'Alignment', control: 'segmented' as const, options: alignmentOptions },
  ],
};

export const linkField = (path: string, label: string) => ({
  path,
  label,
  control: 'link' as const,
});
export const textField = (path: string, label: string, maxLength = 120) => ({
  path,
  label,
  control: 'text' as const,
  maxLength,
});
export const textareaField = (path: string, label: string, rows = 3, maxLength = 600) => ({
  path,
  label,
  control: 'textarea' as const,
  rows,
  maxLength,
});
export const imageField = (path: string, label = 'Image') => ({
  path,
  label,
  control: 'image' as const,
});
export const iconField = (path: string, label = 'Icon') => ({
  path,
  label,
  control: 'icon' as const,
});
