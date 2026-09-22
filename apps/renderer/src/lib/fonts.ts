import type { FontId, ThemeTokens } from '@siteos/schemas';

/**
 * Self-hosted variable fonts (SIL OFL). `scripts/sync-fonts.mjs` places each family's CSS and woff2 files under
 * public/fonts; a page links at most the two families its theme uses. System stacks link nothing.
 */
const selfHosted: ReadonlySet<FontId> = new Set<FontId>([
  'inter',
  'manrope',
  'dm-sans',
  'space-grotesk',
  'fraunces',
  'playfair-display',
  'lora',
]);

export function fontStylesheets(theme: ThemeTokens): string[] {
  const ids = [...new Set([theme.typography.headingFont, theme.typography.bodyFont])];
  return ids.filter((id) => selfHosted.has(id)).map((id) => `/fonts/${id}.css`);
}
