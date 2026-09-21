import { themeTokensSchema } from '@siteos/schemas';
import { describe, expect, it } from 'vitest';
import {
  contrastLevel,
  contrastRatio,
  defaultTheme,
  readableOn,
  themePresets,
  themeToCss,
  themeToVariables,
  themeWarnings,
} from '../src/index.ts';

describe('contrast', () => {
  it('matches WCAG reference values', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
    expect(contrastLevel('#767676', '#ffffff')).toBe('AA');
    expect(contrastLevel('#8f8f8f', '#ffffff')).toBe('AA-large');
    expect(contrastLevel('#cccccc', '#ffffff')).toBe('fail');
  });
  it('picks a readable foreground', () => {
    expect(readableOn('#1d4ed8')).toBe('#ffffff');
    expect(readableOn('#f59e0b')).toBe('#111111');
  });
});

describe('presets', () => {
  it('every preset validates and passes core text contrast', () => {
    for (const p of themePresets) {
      expect(themeTokensSchema.safeParse(p.tokens).success, p.id).toBe(true);
      expect(contrastLevel(p.tokens.colors.text, p.tokens.colors.background), p.id).toMatch(/AA/);
      const warnings = themeWarnings(p.tokens).filter((w) => w.pair === 'Text on background');
      expect(warnings, p.id).toHaveLength(0);
    }
  });
});

describe('tokens', () => {
  it('generates stable variable names', () => {
    const vars = themeToVariables(defaultTheme);
    for (const k of [
      '--color-primary',
      '--color-background',
      '--font-heading',
      '--radius-md',
      '--container-width',
      '--section-spacing',
    ]) {
      expect(vars).toHaveProperty(k);
    }
    expect(themeToCss(defaultTheme)).toMatch(/^:root\{--color-primary:#111111;/);
  });
  it('warns on low-contrast combinations without mutating input', () => {
    const bad = structuredClone(defaultTheme);
    bad.colors.text = '#bbbbbb';
    const w = themeWarnings(bad);
    expect(w.some((x) => x.pair === 'Text on background' && x.level === 'fail')).toBe(true);
    expect(bad.colors.text).toBe('#bbbbbb');
  });
});
