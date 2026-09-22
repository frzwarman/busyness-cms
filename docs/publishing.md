# Publishing model

Built in Milestones 2–3. Everything below exists in `supabase/migrations`.

## Concepts

- **Draft** — mutable, per page, has an integer `revision`. Editors work here. Preview renders it.
- **Version** — immutable snapshot row in `page_versions` (`document jsonb`, `created_by`, `created_at`, `note`).
- **Published pointer** — `pages.published_version_id`. Public routes read only through it.
- **Release** (later) — a named group of versions published together.

## Publish algorithm

1. Studio: `registry.normalizeDocument(draft)`; the Publish button is blocked while any section is invalid, while a
   save is in flight, or after a revision conflict. The dialog lists changes vs. the live version (`describeChanges`).
2. `publish_page(page, note)` (publisher role or above): structural check of the document, insert
   `page_versions` with the next per-page number, set `pages.published_version_id`/`published_at`, snapshot the
   site theme into `sites.published_theme`, write `audit_logs` — one transaction.
3. A trigger makes `page_versions` immutable (no UPDATE; DELETE only via `delete_page` cascade).
4. Caches: published responses carry `s-maxage=300, stale-while-revalidate` and an ETag equal to the version id.
   Explicit purge is a hardening item.
5. Content references and globals are resolved by the Studio (`resolveDocument`) and passed as `p_document`; the version
   stores the inlined result (see [content-and-globals.md](content-and-globals.md)).

## Rollback

`restore_version(version)` (editor role or above) copies the version's document into the draft as a new revision.
The live pointer does not move until the next publish; history stays linear and old versions stay intact.

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

## Public content

Two `security definer` RPCs are granted to `anon`: `get_published_site(slug)` and `get_published_page(site, slug)`.
They join through `pages.published_version_id`, so a draft can never be returned; no table is readable by anon.
`@siteos/content-sdk` wraps them (`createSupabaseContentSource`) and also offers an HTTP source for the JSON API:

- `GET /api/content/sites/:site` → `{ id, name, slug, theme, pages[] }`
- `GET /api/content/sites/:site/pages/*` → `{ versionId, versionNumber, publishedAt, page, site }`

Both set `Cache-Control: public, max-age=0, s-maxage=300, stale-while-revalidate=86400` and an ETag; a matching
`If-None-Match` returns 304. Public HTML routes: `/s/:site/*`, or `/*` for `DEFAULT_SITE_SLUG`, or a platform
subdomain when `PUBLIC_PLATFORM_DOMAIN` is set (validated, never an arbitrary Host).
