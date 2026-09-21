# Publishing model (Milestone 3 design)

## Concepts

- **Draft** — mutable, per page, has an integer `revision`. Editors work here. Preview renders it.
- **Version** — immutable snapshot row in `page_versions` (`document jsonb`, `created_by`, `created_at`, `note`).
- **Published pointer** — `pages.published_version_id`. Public routes read only through it.
- **Release** (later) — a named group of versions published together.

## Publish algorithm

1. Load draft; run `registry.normalizeDocument`; refuse if any `issues` (message names the sections).
2. Resolve global sections and content references into the snapshot (so history is self-contained).
3. Insert `page_versions` row; never update existing rows (trigger blocks UPDATE/DELETE).
4. Update `pages.published_version_id` in the same transaction.
5. Purge cache keys for `/api/content/sites/:site/pages/:slug`, the sitemap and any page linking to it.
6. Insert `audit_logs` row: actor, `page.published`, entity id, version id.

## Rollback

"Restore" copies a historical version's document into the draft (new revision). Publishing that draft creates
a new version; history stays linear and old versions stay intact.

## Autosave and concurrency

`PATCH /pages/:id/draft { expectedRevision, document }` compares `expectedRevision` with the stored value and
returns 409 on mismatch with the server document, so the Studio can show "Someone else changed this page" and
never last-write-wins. The Studio already guards against out-of-order responses locally.

## Tables (Milestone 2–3)

```text
organizations, organization_members
sites, site_members, site_settings, site_domains
pages (id, site_id, slug, title, published_version_id, draft_revision)
page_drafts (page_id, revision, document jsonb, updated_by, updated_at)
page_versions (id, page_id, document jsonb, created_by, created_at, note)  -- immutable
globals, global_versions
navigation, navigation_items
assets, asset_variants, asset_usages
content_entries, content_entry_versions
forms, form_fields, form_submissions
redirects
releases, release_entries
audit_logs
```

All tables carry `site_id`; RLS policies check `site_members` for the current user and role.

## Public content API

`GET /api/content/sites/:siteSlug/pages/:slug` returns the published document only, with
`Cache-Control: public, s-maxage=…` and an `ETag` derived from the version id. Draft data is never served.
