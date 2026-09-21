import type { ThemeTokens } from '@siteos/schemas';

export type ThemePreset = {
  id: string;
  name: string;
  description: string;
  tokens: ThemeTokens;
  /** Default section variants a theme prefers; sections fall back to their own defaults. */
  sectionDefaults?: Record<string, { variant?: string }>;
};

const base = {
  layout: { contentWidth: 'standard', sectionSpacing: 'standard', cardSpacing: 'standard' },
} satisfies Partial<ThemeTokens>;

export const themePresets: ThemePreset[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Quiet neutrals, generous whitespace, sharp type.',
    tokens: {
      colors: {
        primary: '#111111',
        secondary: '#4b5563',
        accent: '#2563eb',
        background: '#ffffff',
        surface: '#f5f5f4',
        text: '#111111',
        muted: '#6b7280',
      },
      typography: {
        headingFont: 'system-sans',
        bodyFont: 'system-sans',
        baseSize: 'md',
        headingScale: 'standard',
        headingWeight: 'semibold',
      },
      shape: { radius: 'sm', buttonStyle: 'filled' },
      ...base,
    },
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Serif headlines, warm paper tones, magazine rhythm.',
    tokens: {
      colors: {
        primary: '#7c2d12',
        secondary: '#292524',
        accent: '#b45309',
        background: '#fdfaf5',
        surface: '#f3ede3',
        text: '#1c1917',
        muted: '#78716c',
      },
      typography: {
        headingFont: 'system-serif',
        bodyFont: 'humanist',
        baseSize: 'md',
        headingScale: 'dramatic',
        headingWeight: 'medium',
      },
      shape: { radius: 'none', buttonStyle: 'outline' },
      layout: { contentWidth: 'narrow', sectionSpacing: 'airy', cardSpacing: 'standard' },
    },
    sectionDefaults: { hero: { variant: 'editorial' } },
  },
  {
    id: 'luxury',
    name: 'Luxury',
    description: 'Deep charcoal, gold accent, restrained and spacious.',
    tokens: {
      colors: {
        primary: '#b08d57',
        secondary: '#1f1d1a',
        accent: '#d4af37',
        background: '#0f0e0d',
        surface: '#1a1816',
        text: '#f5f1ea',
        muted: '#a8a29e',
      },
      typography: {
        headingFont: 'system-serif',
        bodyFont: 'system-sans',
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
    description: 'Confident blue, soft radii, product-style layouts.',
    tokens: {
      colors: {
        primary: '#2563eb',
        secondary: '#0f172a',
        accent: '#06b6d4',
        background: '#ffffff',
        surface: '#f1f5f9',
        text: '#0f172a',
        muted: '#64748b',
      },
      typography: {
        headingFont: 'geometric',
        bodyFont: 'system-sans',
        baseSize: 'md',
        headingScale: 'standard',
        headingWeight: 'bold',
      },
      shape: { radius: 'lg', buttonStyle: 'filled' },
      ...base,
    },
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Navy and slate, compact spacing, trustworthy.',
    tokens: {
      colors: {
        primary: '#1e3a8a',
        secondary: '#334155',
        accent: '#0ea5e9',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#0f172a',
        muted: '#64748b',
      },
      typography: {
        headingFont: 'system-sans',
        bodyFont: 'system-sans',
        baseSize: 'sm',
        headingScale: 'compact',
        headingWeight: 'semibold',
      },
      shape: { radius: 'sm', buttonStyle: 'filled' },
      layout: { contentWidth: 'wide', sectionSpacing: 'compact', cardSpacing: 'compact' },
    },
  },
  {
    id: 'playful',
    name: 'Playful',
    description: 'Rounded type, bright accent, friendly energy.',
    tokens: {
      colors: {
        primary: '#db2777',
        secondary: '#4c1d95',
        accent: '#f59e0b',
        background: '#fffbf7',
        surface: '#fff1f2',
        text: '#1f1235',
        muted: '#7c6f8a',
      },
      typography: {
        headingFont: 'system-rounded',
        bodyFont: 'system-rounded',
        baseSize: 'lg',
        headingScale: 'dramatic',
        headingWeight: 'bold',
      },
      shape: { radius: 'full', buttonStyle: 'filled' },
      ...base,
    },
  },
];

export function getPreset(id: string): ThemePreset | undefined {
  return themePresets.find((p) => p.id === id);
}

export const defaultTheme: ThemeTokens = (themePresets[0] as ThemePreset).tokens;
