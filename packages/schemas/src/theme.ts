import { z } from 'zod';

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a 6-digit hex color like #1d4ed8');

/** Curated font stacks. System stacks load nothing; self-hosted families arrive later. */
export const fontIds = [
  'system-sans',
  'system-serif',
  'system-rounded',
  'system-mono',
  'humanist',
  'geometric',
] as const;
export type FontId = (typeof fontIds)[number];

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
    headingFont: z.enum(fontIds),
    bodyFont: z.enum(fontIds),
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
