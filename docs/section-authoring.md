# Adding a section

A section is one folder in `packages/sections/src/<type>/` plus one line in two maps. Follow the steps in order.

## 1. Schema — `schema.ts`

```ts
import { z } from 'zod';
import { sectionStyleFields } from '../shared.ts';

export const quoteSchema = z.object({
  variant: z.enum(['plain', 'card']),
  text: z.string().min(1).max(600),
  author: z.string().max(80).default(''),
  ...sectionStyleFields, // theme + spacing
});
export type QuoteProps = z.output<typeof quoteSchema>;
```

Rules: every enum is a meaningful design choice, never a CSS value. Use `imageRefSchema`, `buttonSchema`,
`linkSchema` from `@siteos/schemas` for media and links. Give optional text fields `.default('')` and optional
objects `.nullable().default(null)` so `create()` produces a complete document.

## 2. Definition — `definition.ts`

```ts
export const quoteDefinition = defineSection({
  type: 'quote',
  title: 'Quote',
  description: 'A single customer quote with attribution.',
  category: 'content',
  schemaVersion: 1,
  schema: quoteSchema,
  defaults: { variant: 'plain', text: 'They roast on Tuesdays and you can taste it.', author: 'Sari, regular since 2020', theme: 'surface', spacing: 'standard' },
  variants: [
    { value: 'plain', label: 'Plain', thumbnail: ['T T', 'E'] },
    { value: 'card', label: 'Card', thumbnail: ['C'] },
  ],
  inspector: [
    { id: 'quote', label: 'Quote', fields: [
      { path: 'text', label: 'Quote', control: 'textarea', rows: 4, maxLength: 600 },
      { path: 'author', label: 'Attribution', control: 'text', maxLength: 80 },
    ] },
  ],
  performance: { expectedImages: 0 },
  keywords: ['testimonial', 'review'],
});
```

`defineSection` throws at load time if `defaults` fail the schema or a variant is not accepted, so a
mistake shows up in the first test run, not in production. Inspector groups become the navigator's children
(Hero → Heading, Buttons, Media). Do **not** add theme/spacing/variant fields to `inspector`; the Studio renders
those from `capabilities`.

Thumbnail DSL: one string per row, `|` separates columns, tokens `E`yebrow `H`eading `T`ext `B`utton `M`edia
`C`ard `L`ogo `I`con, `*` prefix = background media row.

## 3. Register — `src/index.ts`

Export the definition and add it to `new SectionRegistry([...])`.

## 4. Migrations

New sections start at `schemaVersion: 1` with `migrations: []`. When you change the schema, read
[section-migrations.md](section-migrations.md).

## 5. Renderer — `Quote.astro`

```astro
---
import SectionFrame from '../primitives/SectionFrame.astro';
import type { SectionRenderProps } from '../render-context.ts';
import type { QuoteProps } from './schema.ts';
type Props = SectionRenderProps<QuoteProps>;
const { props: p, section } = Astro.props;
---
<SectionFrame section={section} theme={p.theme} spacing={p.spacing} class:list={[`v-${p.variant}`]}>
  <blockquote class:list={[p.variant === 'card' && 'card']}>
    <p class="t-h3" data-field="text">{p.text}</p>
    {p.author && <footer class="muted" data-field="author">{p.author}</footer>}
  </blockquote>
</SectionFrame>
<style>
  blockquote { margin: 0; max-width: 44rem; display: grid; gap: 1rem; }
</style>
```

Rules: use `SectionFrame` (semantic `<section>`, editor hooks, theme/spacing classes). Put `data-field="<path>"`
on editable elements so clicking them in the preview focuses the right control. Use only CSS variables from
the design system (`--color-*`, `--font-*`, `--radius-*`, `--section-spacing`, `--card-spacing`) and the section
surface variables (`--section-bg`, `--section-fg`, `--section-muted`, `--section-border`). Use `Picture`
for images (responsive attributes, focal point) and `Button` for CTAs (typed link resolution). No client
JavaScript unless the section is genuinely interactive; then a React island is acceptable.

Then map it in `apps/renderer/src/sections/map.ts`:

```ts
import Quote from '@siteos/sections/quote/Quote.astro';
export const sectionComponents = { ..., quote: Quote } as const;
```

The renderer test fails if the map and the registry disagree.

## 6. Tests

Add cases to `packages/sections/test/registry.test.ts` (or a `test/quote.test.ts`): defaults validate, each
variant validates, invalid props are reported with paths. If you added a migration, test it with a stored v(n-1) fixture.

## 7. Verify

```bash
pnpm typecheck && pnpm test && pnpm --filter @siteos/renderer build
```

Open the Studio, add the section from the picker, check every variant at desktop/tablet/mobile widths,
and confirm clicking each `data-field` element focuses its control.
