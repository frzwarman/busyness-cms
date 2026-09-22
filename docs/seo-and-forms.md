# SEO and forms

## SEO

**Per page** (Page settings sheet, top bar): search title, description, canonical override, social title/description/
image, "hide from search engines". Search and social previews are labelled approximations. Changing a published
address prompts for a redirect.

**Per site** (Site settings tool): tagline (home title becomes "Name — Tagline"), default description, logo, favicon,
default social image, primary web address (canonical base), X handle, structured data, redirects.

**Rendered head** (`Site.astro`): title, description, canonical, robots, Open Graph (type, site_name, title,
description, url, image, image:alt), Twitter card, favicon, theme-color, self-hosted font stylesheets, JSON-LD.

**Structured data** (`buildJsonLd` in `@siteos/schemas`): `Organization`, `LocalBusiness`, `Restaurant`,
`ProfessionalService` or `Hotel` plus a `WebPage`/`WebSite` node. Only configured facts are emitted — no address,
hours, ratings or prices unless the owner typed them.

**Routes**: `/sitemap.xml` and `/robots.txt` per site (root/subdomain sites) or under `/s/<site>/`. Robots disallows
`/preview` and `/api/` and points at the sitemap. Unknown paths check `redirects` and answer 301.

**Canonical resolution**: page override → site's primary address → request origin + site prefix.

## Forms

Forms live in `forms(site_id, name, fields, settings)`; submissions in `form_submissions`. The **Forms** tool builds
forms from templates (Contact, Quote request, Newsletter, Booking enquiry, Job application) with field types text,
email, phone, textarea, select, radio, checkbox and date. The **Form** section (`contact-form`) references a form by
id; the definition is inlined at preview/publish so the public page needs no lookup.

### Submission path

```text
Public page  ── POST (form-encoded or JSON) ──►  edge worker /forms/:id  ── rpc submit_form (anon) ──►  form_submissions
```

Protection, in order: per-IP rate limit (best effort, per isolate), 64 KB body cap, honeypot field (`website`),
timestamp window (3 s – 24 h), field count cap, then server-side validation against the form definition in
`submit_form()` (required, type, max length, email shape, option membership). Unknown fields are dropped. Meta stores
page, referer and user agent only — no IP addresses. No CAPTCHA yet; add one if spam appears.

Without JavaScript the worker redirects back with `?submitted=<form id>` and the section shows the success message.
With JavaScript a few inline lines submit via fetch and confirm in place.

### Inbox

Read/unread, filter by form and date range, expand to read, delete with confirmation, CSV export per form (values
are quoted and spreadsheet-formula-safe). Email notifications and webhooks are not built; the schema leaves room.
