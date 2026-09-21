# Publishing model

Drafts and revisions exist today (Milestone 2). Versions, publish and the public API are Milestone 3.

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

## Autosave and concurrency (built)

`save_page_draft(p_page, p_expected_revision, p_document)` locks the draft row, compares the revision, and raises
`revision_conflict` (SQLSTATE 40001, detail = current revision) on mismatch. `@siteos/db` maps that to
`DraftConflictError`; the Studio stops autosaving, shows “Changed elsewhere” and offers Reload. The Studio also
ignores save responses for documents that changed while the request was in flight.

## Tables (Milestone 2 built: organizations, members, sites, site_members, pages, page_drafts, audit_logs)

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
