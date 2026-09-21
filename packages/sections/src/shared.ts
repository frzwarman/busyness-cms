import { sectionSpacingSchema, sectionThemeSchema } from '@siteos/schemas';

/** Style fields every themable section carries. Kept out of section inspectors: Studio renders them from capabilities. */
export const sectionStyleFields = {
  theme: sectionThemeSchema.default('light'),
  spacing: sectionSpacingSchema.default('standard'),
};

export const alignmentOptions = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
];
