/** WCAG 2.x relative luminance and contrast ratio. Pure math, no dependencies. */
export function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m?.[1]) throw new Error(`Invalid hex color: ${hex}`);
  const n = Number.parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export type ContrastLevel = 'AAA' | 'AA' | 'AA-large' | 'fail';

/** Classify a text/background pair per WCAG 2.2 thresholds (4.5 normal, 3 large, 7 AAA). */
export function contrastLevel(fg: string, bg: string): ContrastLevel {
  const r = contrastRatio(fg, bg);
  if (r >= 7) return 'AAA';
  if (r >= 4.5) return 'AA';
  if (r >= 3) return 'AA-large';
  return 'fail';
}

/** Pick the readable foreground (white or near-black) for a given background. */
export function readableOn(bg: string, candidates: string[] = ['#ffffff', '#111111']): string {
  return candidates.map((c) => ({ c, r: contrastRatio(c, bg) })).sort((a, b) => b.r - a.r)[0]
    ?.c as string;
}

/** Mix a color toward another by t in 0..1 (used for derived hover/soft tones). */
export function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const ch = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `#${[ch(ar, br), ch(ag, bg), ch(ab, bb)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}
