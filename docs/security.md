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

## Planned (Milestones 2–5)

- Supabase Auth, self-registration disabled by default.
- RLS on every table keyed by `site_id` + membership role; tested with cross-site access attempts.
- Signed R2 uploads via the edge worker; MIME sniffing; SVG sanitization.
- Form endpoints: schema validation, honeypot, timestamp check, size/field limits, rate limiting.
- Audit logs without secrets or raw submission bodies.
