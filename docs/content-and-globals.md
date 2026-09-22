# Content library and global sections

## Content library

`content_entries(site_id, collection, data jsonb, tags[], sort_order)` holds reusable records in predefined
collections: testimonials, services, team, locations, faqs, logos, stats, projects. Each collection
(`packages/sections/src/content/collections.ts`) mirrors the item schema of the sections that can display it, so an
entry drops straight into a section's `items`. The Content tab edits entries with the same generated controls as the
inspector. Custom collections can be added later by appending to this list; no section code changes.

Sections bound to a collection (`definition.collection = { id, itemsPath }`) carry a `source` prop:

```ts
{ mode: 'manual' | 'collection', selection: 'all' | 'tag' | 'picked', tag, ids[], limit }
```

`manual` keeps the items typed into the section. `collection` fills `items` from the library at **preview** and
**publish** time via `resolveDocument()` (pure, deterministic). If nothing matches, the section keeps its manual items so
a page never renders empty. Editing an entry updates every section that sources it, on their next publish.

Deleting an entry checks `content_entry_refs()` (draft sections that *picked* it) and asks for confirmation. Tag/all
selections simply stop showing it.

## Global sections

`globals(site_id, name, section jsonb, revision)`. A page references a global with `SectionInstance.globalId`; the
placeholder keeps the page-level id, order and hidden flag, while type/props come from the global at resolve time.

- **Make global** (section menu) creates the global from the section and links it.
- Editing a linked section in the inspector edits the *global* (debounced `save_global` with a revision check) — not the
  page's undo stack, since the change is shared.
- **Insert** from the section picker's "Global sections" category adds a placeholder to any page.
- **Detach from global** copies the current content into the page (`detachGlobal`), which then evolves independently.
- Deleting a global is refused while any draft page references it (`global_refs()`).

## Publishing with references

`publish_page(page, note, resolved_document)` stores the resolved document (content and globals inlined) as the immutable
version, while the draft keeps its references. The server checks the resolved document has the same page id and slug as
the draft; the caller must already be a publisher. Restoring a version restores the resolved content — links to
collections/globals are recreated by pointing the sections at the library again.
