import type { ThemeTokens } from '@siteos/schemas';

export type ThemePreset = {
  id: string;
  name: string;
  description: string;
  tokens: ThemeTokens;
  /** Default section variants a theme prefers; sections fall back to their own defaults. */
  sectionDefaults?: Record<string, { variant?: string }>;
};

/**
 * Each preset is a specific pairing and palette, not a recolor of the same layout. Body text always clears
 * WCAG AA on the background (tested); accents are used sparingly by the sections.
 */
export const themePresets: ThemePreset[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    description:
      'Ink on white, one cobalt accent, Inter throughout. Disappears behind your content.',
    tokens: {
      colors: {
        primary: '#111214',
        secondary: '#4a4f57',
        accent: '#1f4fd8',
        background: '#ffffff',
        surface: '#f4f4f2',
        text: '#111214',
        muted: '#61666e',
      },
      typography: {
        headingFont: 'inter',
        bodyFont: 'inter',
        baseSize: 'md',
        headingScale: 'standard',
        headingWeight: 'semibold',
      },
      shape: { radius: 'sm', buttonStyle: 'filled' },
      layout: { contentWidth: 'standard', sectionSpacing: 'standard', cardSpacing: 'standard' },
    },
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description:
      'Fraunces headlines with Manrope text. Paper white, deep green, oxblood for emphasis.',
    tokens: {
      colors: {
        primary: '#173f35',
        secondary: '#2d2a26',
        accent: '#8a2432',
        background: '#f8f7f2',
        surface: '#ecebe2',
        text: '#1b1d1a',
        muted: '#5f655f',
      },
      typography: {
        headingFont: 'fraunces',
        bodyFont: 'manrope',
        baseSize: 'md',
        headingScale: 'dramatic',
        headingWeight: 'medium',
      },
      shape: { radius: 'sm', buttonStyle: 'filled' },
      layout: { contentWidth: 'narrow', sectionSpacing: 'airy', cardSpacing: 'standard' },
    },
    sectionDefaults: { hero: { variant: 'editorial' } },
  },
  {
    id: 'luxury',
    name: 'Luxury',
    description: 'Playfair Display on near-black with champagne. Spacious, hushed, expensive.',
    tokens: {
      colors: {
        primary: '#cbb682',
        secondary: '#8f8a7e',
        accent: '#e4d3a3',
        background: '#0e0d0c',
        surface: '#181614',
        text: '#f2eee4',
        muted: '#a9a397',
      },
      typography: {
        headingFont: 'playfair-display',
        bodyFont: 'inter',
        baseSize: 'md',
        headingScale: 'dramatic',
        headingWeight: 'medium',
      },
      shape: { radius: 'none', buttonStyle: 'outline' },
      layout: { contentWidth: 'standard', sectionSpacing: 'airy', cardSpacing: 'airy' },
    },
  },
  {
    id: 'modern',
    name: 'Modern',
    description:
      'Space Grotesk headlines, electric blue, generous radii. For products and studios.',
    tokens: {
      colors: {
        primary: '#2447ff',
        secondary: '#0f1222',
        accent: '#00b3a4',
        background: '#ffffff',
        surface: '#f1f3f9',
        text: '#0f1222',
        muted: '#5b6178',
      },
      typography: {
        headingFont: 'space-grotesk',
        bodyFont: 'inter',
        baseSize: 'md',
        headingScale: 'standard',
        headingWeight: 'bold',
      },
      shape: { radius: 'lg', buttonStyle: 'filled' },
      layout: { contentWidth: 'standard', sectionSpacing: 'standard', cardSpacing: 'standard' },
    },
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Manrope, navy and amber, compact rhythm. Trustworthy without being dull.',
    tokens: {
      colors: {
        primary: '#14213d',
        secondary: '#334155',
        accent: '#e0a526',
        background: '#ffffff',
        surface: '#f4f6fa',
        text: '#111827',
        muted: '#556075',
      },
      typography: {
        headingFont: 'manrope',
        bodyFont: 'manrope',
        baseSize: 'sm',
        headingScale: 'compact',
        headingWeight: 'bold',
      },
      shape: { radius: 'sm', buttonStyle: 'filled' },
      layout: { contentWidth: 'wide', sectionSpacing: 'compact', cardSpacing: 'compact' },
    },
  },
  {
    id: 'organic',
    name: 'Organic',
    description: 'Lora with DM Sans. Clay, moss and linen. For food, wellness and craft.',
    tokens: {
      colors: {
        primary: '#5b4636',
        secondary: '#3f5a45',
        accent: '#b8632f',
        background: '#faf7f2',
        surface: '#f0ebe1',
        text: '#2a231d',
        muted: '#6d655c',
      },
      typography: {
        headingFont: 'lora',
        bodyFont: 'dm-sans',
        baseSize: 'md',
        headingScale: 'standard',
        headingWeight: 'medium',
      },
      shape: { radius: 'lg', buttonStyle: 'filled' },
      layout: { contentWidth: 'standard', sectionSpacing: 'airy', cardSpacing: 'standard' },
    },
  },
  {
    id: 'playful',
    name: 'Playful',
    description: 'DM Sans, coral and violet with a yellow spark. Friendly, energetic, rounded.',
    tokens: {
      colors: {
        primary: '#d9345a',
        secondary: '#3a2d8f',
        accent: '#f2b705',
        background: '#ffffff',
        surface: '#fff1f4',
        text: '#231a3a',
        muted: '#6b6280',
      },
      typography: {
        headingFont: 'dm-sans',
        bodyFont: 'dm-sans',
        baseSize: 'lg',
        headingScale: 'dramatic',
        headingWeight: 'bold',
      },
      shape: { radius: 'full', buttonStyle: 'filled' },
      layout: { contentWidth: 'standard', sectionSpacing: 'standard', cardSpacing: 'standard' },
    },
  },
];

export function getPreset(id: string): ThemePreset | undefined {
  return themePresets.find((p) => p.id === id);
}

export const defaultTheme: ThemeTokens = (themePresets[0] as ThemePreset).tokens;
