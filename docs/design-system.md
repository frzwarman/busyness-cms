# Design system

## Tokens (`themeTokensSchema` in `@siteos/schemas`)

| Group | Fields |
|-------|--------|
| colors | primary, secondary, accent, background, surface, text, muted (6-digit hex) |
| typography | headingFont, bodyFont (curated ids), baseSize sm/md/lg, headingScale compact/standard/dramatic, headingWeight |
| shape | radius none/sm/md/lg/full, buttonStyle filled/outline/text |
| layout | contentWidth narrow/standard/wide, sectionSpacing compact/standard/airy, cardSpacing |

`themeToVariables()` in `@siteos/design-system` derives the CSS custom properties. Derived values
(`--color-primary-contrast`, `--color-primary-hover`, `--color-border`) are computed, not stored.

## Generated variables

```text
--color-primary --color-primary-contrast --color-primary-hover --color-primary-soft
--color-secondary --color-secondary-contrast --color-accent --color-accent-contrast
--color-background --color-surface --color-text --color-muted --color-border
--font-heading --font-body --font-size-base --heading-scale --heading-weight
--radius-sm --radius-md --radius-lg --radius-button
--container-width --section-spacing --card-spacing
```

`base.css` adds the type scale (`.t-display .t-h1 .t-h2 .t-h3 .t-lead`), section surfaces
(`.section.theme-light|surface|dark|brand` set `--section-bg/--section-fg/--section-muted/--section-border`),
spacing classes, `.container`, `.btn .btn-filled|outline|text`, `.card`, `.eyebrow`, `.media`.

Text colors the user never picks are derived to clear WCAG AA (4.5:1) on the surface they sit on:
`--color-accent-text` / `-on-surface` / `-on-dark` (accent, else primary, else the surface's text) and
`--color-muted-on-surface|dark|brand` (the muted tone stepped toward solid until it passes). Section surfaces and
`.eyebrow` consume these, so a decorative accent or a translucent muted never becomes unreadable copy.

## Fonts

Seven self-hosted variable families (SIL OFL 1.1): Inter, Manrope, DM Sans, Space Grotesk, Fraunces, Playfair Display,
Lora, plus four system stacks. `apps/renderer/scripts/sync-fonts.mjs` copies each family's CSS and woff2 files from
`@fontsource-variable/*` into `public/fonts`; a page links only the one or two families its theme uses, and browsers
download only the unicode subsets they need. Serif body faces get a longer measure and more leading
(`--measure`, `--body-leading`); display faces track tighter (`--display-tracking`).

## Presets

Minimal (Inter, ink + cobalt), Editorial (Fraunces + Manrope, paper/green/oxblood), Luxury (Playfair on near-black,
champagne), Modern (Space Grotesk, electric blue), Corporate (Manrope, navy + amber), Organic (Lora + DM Sans, clay and
moss), Playful (DM Sans, coral + violet + yellow). Each is a specific pairing and palette, not a recolor. A preset is a
full token set plus optional `sectionDefaults`; applying one only replaces tokens. Every preset is tested to pass AA
contrast for body text.

## Motion

One orchestrated moment: the first section's copy and media settle into place on load (`rise`/`settle`, 0.7–0.9 s,
respecting `prefers-reduced-motion`). No per-section reveals, no hover lifts on cards.

## Contrast

`contrastRatio`, `contrastLevel` (AAA/AA/AA-large/fail) and `themeWarnings` implement WCAG 2.x math. The Brand
panel shows warnings; it never changes the user's colors on its own.

## Brand Guard (planned, Milestone 6/8)

A site setting that restricts editors to approved colors, fonts and presets. It will be enforced by schema
refinement on save and by RLS-checked permissions, not only hidden controls.
