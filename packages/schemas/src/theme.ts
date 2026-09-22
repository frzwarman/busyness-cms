import { z } from 'zod';

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a 6-digit hex color like #1d4ed8');

/**
 * Curated fonts. `system-*` load nothing. The named families are self-hosted variable fonts (SIL Open Font
 * License) bundled by the renderer and only loaded when a theme uses them.
 */
export const fontIds = [
  'inter',
  'manrope',
  'dm-sans',
  'space-grotesk',
  'fraunces',
  'playfair-display',
  'lora',
  'system-sans',
  'system-serif',
  'system-rounded',
  'system-mono',
] as const;
export type FontId = (typeof fontIds)[number];

/** Font ids that existed in earlier releases; stored themes are migrated on read so nothing breaks. */
export const legacyFontIds: Record<string, FontId> = {
  humanist: 'manrope',
  geometric: 'space-grotesk',
};
const fontIdSchema = z.preprocess(
  (v) => (typeof v === 'string' && v in legacyFontIds ? legacyFontIds[v] : v),
  z.enum(fontIds),
);

export const themeTokensSchema = z.object({
  colors: z.object({
    primary: hex,
    secondary: hex,
    accent: hex,
    background: hex,
    surface: hex,
    text: hex,
    muted: hex,
  }),
  typography: z.object({
    headingFont: fontIdSchema,
    bodyFont: fontIdSchema,
    baseSize: z.enum(['sm', 'md', 'lg']),
    headingScale: z.enum(['compact', 'standard', 'dramatic']),
    headingWeight: z.enum(['medium', 'semibold', 'bold']),
  }),
  shape: z.object({
    radius: z.enum(['none', 'sm', 'md', 'lg', 'full']),
    buttonStyle: z.enum(['filled', 'outline', 'text']),
  }),
  layout: z.object({
    contentWidth: z.enum(['narrow', 'standard', 'wide']),
    sectionSpacing: z.enum(['compact', 'standard', 'airy']),
    cardSpacing: z.enum(['compact', 'standard', 'airy']),
  }),
});
export type ThemeTokens = z.infer<typeof themeTokensSchema>;

/** Section-level theme choice; the design system maps it to surface/foreground variables. */
export const sectionThemeSchema = z.enum(['light', 'dark', 'brand', 'surface']);
export type SectionTheme = z.infer<typeof sectionThemeSchema>;
export const sectionSpacingSchema = z.enum(['none', 'compact', 'standard', 'large']);
export type SectionSpacing = z.infer<typeof sectionSpacingSchema>;
