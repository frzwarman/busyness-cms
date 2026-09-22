import type { ThemeTokens } from '@siteos/schemas';
import { contrastLevel, mix, readableOn } from './color.ts';
import { fontStacks } from './fonts.ts';

const radius = { none: '0px', sm: '4px', md: '8px', lg: '16px', full: '999px' };
const contentWidth = { narrow: '64rem', standard: '72rem', wide: '84rem' };
const sectionSpacing = { compact: '3rem', standard: '5rem', airy: '7rem' };
const cardSpacing = { compact: '1rem', standard: '1.5rem', airy: '2rem' };
const baseSize = { sm: '15px', md: '16px', lg: '18px' };
const headingScale = { compact: '1.2', standard: '1.25', dramatic: '1.333' };
const headingWeight = { medium: '500', semibold: '600', bold: '700' };

/** Flat map of CSS custom properties derived from theme tokens. Stable names; sections consume only these. */
export function themeToVariables(t: ThemeTokens): Record<string, string> {
  const c = t.colors;
  return {
    '--color-primary': c.primary,
    '--color-primary-contrast': readableOn(c.primary),
    '--color-primary-hover': mix(
      c.primary,
      readableOn(c.primary) === '#ffffff' ? '#000000' : '#ffffff',
      0.12,
    ),
    '--color-primary-soft': mix(c.primary, c.background, 0.88),
    '--color-secondary': c.secondary,
    '--color-secondary-contrast': readableOn(c.secondary),
    '--color-accent': c.accent,
    '--color-accent-contrast': readableOn(c.accent),
    '--color-background': c.background,
    '--color-surface': c.surface,
    '--color-text': c.text,
    '--color-muted': c.muted,
    '--color-border': mix(c.text, c.background, 0.85),
    '--font-heading': fontStacks[t.typography.headingFont].stack,
    '--font-body': fontStacks[t.typography.bodyFont].stack,
    // Serif body text gets a longer measure and more leading (Bringhurst); display faces track tighter.
    '--body-leading': fontStacks[t.typography.bodyFont].serif ? '1.7' : '1.6',
    '--measure': fontStacks[t.typography.bodyFont].serif ? '68ch' : '62ch',
    '--display-tracking': fontStacks[t.typography.headingFont].serif ? '-0.015em' : '-0.03em',
    '--font-size-base': baseSize[t.typography.baseSize],
    '--heading-scale': headingScale[t.typography.headingScale],
    '--heading-weight': headingWeight[t.typography.headingWeight],
    '--radius-sm': t.shape.radius === 'none' ? '0px' : t.shape.radius === 'full' ? '999px' : '4px',
    '--radius-md': radius[t.shape.radius],
    '--radius-lg': t.shape.radius === 'full' ? '24px' : radius[t.shape.radius],
    '--radius-button': radius[t.shape.radius],
    '--container-width': contentWidth[t.layout.contentWidth],
    '--section-spacing': sectionSpacing[t.layout.sectionSpacing],
    '--card-spacing': cardSpacing[t.layout.cardSpacing],
    // Shadows tinted with the text color read as depth on any palette.
    '--shadow-sm': `0 1px 2px color-mix(in srgb, ${c.text} 8%, transparent)`,
    '--shadow-md': `0 8px 24px -12px color-mix(in srgb, ${c.text} 28%, transparent)`,
    '--shadow-lg': `0 24px 60px -24px color-mix(in srgb, ${c.text} 40%, transparent)`,
  };
}

/** `:root { ... }` block plus the section-theme surfaces. Injected once per page. */
export function themeToCss(t: ThemeTokens): string {
  const vars = Object.entries(themeToVariables(t))
    .map(([k, v]) => `${k}:${v};`)
    .join('');
  return `:root{${vars}}`;
}

export type ThemeWarning = {
  pair: string;
  level: ReturnType<typeof contrastLevel>;
  message: string;
};

/** Deterministic accessibility warnings for the token set. Never mutates the theme. */
export function themeWarnings(t: ThemeTokens): ThemeWarning[] {
  const c = t.colors;
  const pairs: Array<[string, string, string]> = [
    ['Text on background', c.text, c.background],
    ['Text on surface', c.text, c.surface],
    ['Muted text on background', c.muted, c.background],
    ['Primary button label', readableOn(c.primary), c.primary],
    ['Primary as text on background', c.primary, c.background],
  ];
  const out: ThemeWarning[] = [];
  for (const [pair, fg, bg] of pairs) {
    const level = contrastLevel(fg, bg);
    if (level === 'fail' || level === 'AA-large') {
      out.push({
        pair,
        level,
        message: `${pair} may not meet WCAG AA contrast (${level === 'fail' ? 'below 3:1' : 'only passes for large text'}).`,
      });
    }
  }
  return out;
}
