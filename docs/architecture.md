# Architecture

## Principles

1. **The CMS stores intent, the renderer produces markup.** Pages are `{ slug, sections: [{ id, type, schemaVersion, props }] }`. No HTML is ever persisted.
2. **One renderer.** The preview iframe fetches HTML from the same `PageRenderer.astro` used by public routes. There is no second, approximate preview implementation.
3. **Freedom inside guardrails.** Users choose variants, alignment, theme, spacing, media position. They never see CSS properties.
4. **Typed contracts at every boundary.** Zod schemas in `@siteos/schemas` validate persisted documents, postMessage payloads and HTTP bodies.
5. **Registry over duplication.** Everything the editor and renderer know about a section comes from its `defineSection()` call.

## Packages and dependency direction

```text
schemas  ←  design-system
   ↑            ↑
sections  ←  editor-core  ←  studio
   ↑            
renderer (imports sections/*.astro, design-system, schemas)
```

`schemas` has no workspace dependencies. `sections` depends on `schemas`. `editor-core` depends on both.
Apps depend on packages; packages never depend on apps.

## Editor state model (`packages/editor-core`)

A pure reducer over:

```ts
{ document: PageDocument; selectedSectionId; past: PageDocument[]; future: PageDocument[]; dirty; lastEdit }
```

- Actions: `load`, `select`, `addSection`, `removeSection`, `duplicateSection`, `moveSection`, `toggleHidden`,
  `updateProps` (dot-path patch), `setVariant`, `renamePage`, `undo`, `redo`, `markSaved`.
- Consecutive `updateProps` on the same `sectionId:path` within 800 ms coalesce into one undo step.
- History is capped at 100 snapshots. Documents are treated as immutable values.
- Editor undo (seconds/minutes) is a separate concept from version history (saved/published).

The Studio wraps the reducer in `useReducer` inside `EditorProvider`, adds autosave (1 s debounce, in-flight
guard so an older save can never mark a newer document as saved), keyboard shortcuts, device state, and
focus requests coming from the preview.

## Preview protocol (`packages/schemas/src/preview.ts`)

| Direction | Message | Payload |
|-----------|---------|---------|
| iframe → Studio | `siteos:ready` | — (sent on every load, including reloads) |
| Studio → iframe | `siteos:render` | `{ page, theme, pages, selectedSectionId }` |
| Studio → iframe | `siteos:select` | `sectionId \| null` (no re-render) |
| iframe → Studio | `siteos:rendered` | `{ ok, height? , error? }` |
| iframe → Studio | `siteos:selected` | `{ sectionId, fieldPath \| null }` |

Security: both sides compare `event.origin` with the configured origin (`VITE_PREVIEW_ORIGIN` /
`PUBLIC_STUDIO_ORIGIN`), the Studio also checks `event.source` is its iframe, payloads are parsed with Zod,
and the render route is same-origin only (Astro CSRF origin check). The iframe swaps `<main>` from a
`DOMParser` document and adds any stylesheets it does not have yet, so new section types render styled.

## Renderer (`apps/renderer`)

- `src/layouts/Site.astro` — `<head>`, theme `:root` variables, base.css, skip link.
- `src/components/PageRenderer.astro` — loops visible sections, builds a `RenderContext` (link resolution, `isFirst`).
- `src/components/SectionRenderer.astro` — validates via the registry, looks up the Astro component from `src/sections/map.ts`.
  Invalid sections render an explanatory block in preview mode and are skipped in public mode.
- `src/pages/[...slug].astro` — public pages (Milestone 1: demo fixtures; Milestone 3: published snapshots).
- `src/pages/preview/index.astro` — preview shell script; `src/pages/preview/render.astro` — POST render route.

Section `.astro` files live in `packages/sections/src/<type>/` next to their schema so a section is one folder.
Their scoped `<style>` blocks use only design tokens.

## Studio (`apps/studio`)

Routes: `/` redirects to the first page; `/pages/$pageId` opens the editor. TanStack Query holds the site draft
(theme + pages); the editor reducer holds the page being edited. shadcn/ui components live in
`src/components/ui`. Side panels become sheets under the `lg` breakpoint.

## Data model (Milestone 2+)

See [publishing.md](publishing.md) for tables and the publish algorithm.
