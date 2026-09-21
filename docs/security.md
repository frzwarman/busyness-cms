# Security

## Boundaries validated with Zod

- Persisted documents (`pageDocumentSchema`, section schemas) on load and save.
- postMessage in both directions (`studioToPreviewMessageSchema`, `previewToStudioMessageSchema`).
- HTTP bodies (`previewRenderPayloadSchema` on `POST /preview/render`).

## Preview

- Origin check on both sides; `'*'` is never accepted (`isTrustedOrigin`).
- Studio also checks `event.source === iframe.contentWindow`.
- Render route is same-origin only (Astro CSRF origin check returns 403 otherwise), `Cache-Control: no-store`,
  `X-Robots-Tag: noindex`; `/preview` is disallowed in `robots.txt`.
- No `eval`, no `innerHTML` from message data; the iframe inserts nodes parsed from the renderer's own response.

## Links and content

- `linkSchema` only accepts `http(s)` URLs (Zod's `z.url()` alone accepts `javascript:` — the test suite guards this).
- Internal links reference page ids; a missing target renders as a non-link with a title, never a broken href.
- Astro escapes all interpolated text. Rich text (Tiptap, later) will be sanitized to an allowlist before render.

## Database (built)

- Supabase Auth; the Studio has no sign-up form and magic links use `shouldCreateUser: false`. Disable
  "Allow new users to sign up" in the Supabase dashboard as well: the client cannot enforce that.
- RLS on every table, keyed by `site_id` + membership role via `has_site_role()`. Mutations with invariants are
  `security definer` RPCs that re-check the role; direct inserts into `sites`/`page_drafts` have no policy.
- Only the publishable key ships to browsers. `SUPABASE_SECRET_KEY` is used by tests and server-side code only.
- `packages/db/test/rls.test.ts` creates two users and asserts cross-site reads/writes fail through tables and RPCs.

## Assets (built)

- No R2 credentials in the browser. Uploads go through the worker with the user's Supabase token; the worker checks
  the site role, issues an HMAC ticket (15 min) that fixes site, asset id, user and variant names, and derives object
  keys from ids only.
- Declared MIME types are verified against magic bytes; SVG is refused; 25 MB cap; only JPEG/PNG/WebP/GIF/PDF.
- Metadata is written by `create_asset()` under RLS; if that fails, the worker deletes the bytes it just stored.
- The worker's CORS allows only the configured Studio origin.

## Planned

- Signed R2 uploads via the edge worker; MIME sniffing; SVG sanitization.
- Form endpoints: schema validation, honeypot, timestamp check, size/field limits, rate limiting.
- Audit logs without secrets or raw submission bodies.
