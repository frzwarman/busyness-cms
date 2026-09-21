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

## Fonts

Only system stacks ship today (`system-sans`, `system-serif`, `system-rounded`, `system-mono`, `humanist`,
`geometric`): zero network cost and no licensing questions. Self-hosted families with known licenses can be
added to `fonts.ts` later with explicit weight limits and preload only for critical files.

## Presets

Minimal, Editorial, Luxury, Modern, Corporate, Playful. A preset is a full token set plus optional
`sectionDefaults` (preferred variants). Applying a preset only replaces tokens; page content is untouched.
Every preset is tested to pass AA contrast for body text.

## Contrast

`contrastRatio`, `contrastLevel` (AAA/AA/AA-large/fail) and `themeWarnings` implement WCAG 2.x math. The Brand
panel shows warnings; it never changes the user's colors on its own.

## Brand Guard (planned, Milestone 6/8)

A site setting that restricts editors to approved colors, fonts and presets. It will be enforced by schema
refinement on save and by RLS-checked permissions, not only hidden controls.
