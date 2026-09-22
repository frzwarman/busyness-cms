# Website Health and hardening

## Website Health (`packages/health`)

Deterministic checks over every draft page, the site's settings and its theme. Each issue says what is wrong,
where, and what to do, and links to the page/section/field or settings area. Categories roll up to
Excellent / Good / Needs attention; there is no numeric score because none of these checks is precise enough to
deserve one.

| Category | Checks |
|----------|--------|
| Brand | logo set, favicon set |
| SEO | default description, default social image, structured data type, per-page: title length, duplicate titles, description present/length, noindex |
| Accessibility | theme contrast pairs (WCAG AA), images without alt (unless decorative), more than one hero (h1), no hero, unlabeled buttons, vague link text |
| Content | phone/email present, empty pages, links to deleted pages, CTAs without buttons, form sections without a form, placeholder illustrations, starter copy left in place |
| Performance | oversized hero images without resized variants, many image-heavy sections, multiple video embeds |

Automated checks catch common problems; they don't replace testing with real people.

## Measured page weight

The preview iframe reads the Resource Timing API after each render and reports real transfer sizes (HTML, CSS,
JavaScript, fonts, images, other, requests). The edge worker sends `Timing-Allow-Origin` on asset responses so
cross-origin image sizes are visible. The panel says what it is: bytes the preview downloaded at desktop width,
not a Lighthouse score.

## Caching

Published HTML and API responses carry `Cache-Control: public, max-age=0, s-maxage=60, stale-while-revalidate=86400`
and an ETag equal to the version id. Publish calls the edge worker's `/cache/purge` (publishers only) with the page,
sitemap and API URLs; it purges through the Cloudflare API when `CF_ZONE_ID` (var) and `CF_API_TOKEN` (secret, Cache
Purge permission) are configured, and otherwise reports `not-configured` and lets the 60-second TTL do the work.

## Error recovery

- An error boundary around the editor route explains that the saved draft is safe and offers reload; drafts already
  live on the server with revision checks.
- Preview failures show an inline message with retry; a reloaded iframe re-renders on `ready`.
- Autosave states: Saved / Unsaved changes / Saving / Failed to save / Changed elsewhere (reload).

## Deleting things safely

- Pages: shows how many other pages link to the page (typed internal links) and warns about 404s for published
  pages before deleting; suggests a redirect.
- Changing a published address offers a one-click redirect from the old address.
- Assets, content entries, globals and forms were already protected (see their docs).

## Activity

Site settings lists the last 40 audit entries (site created, page published/restored/deleted, theme and settings
changes, asset uploads and deletions).

## Accessibility sweep

Playwright runs axe-core against the Studio editor (including the section picker dialog) and against a published
page, failing on serious/critical violations. The public page is also checked with JavaScript disabled and for a
single `h1` and a `lang` attribute (set in Site settings). Drag and drop has keyboard and menu alternatives.

## Mobile editor

Under the `lg` breakpoint the tool panel and inspector open as sheets from the top bar; an e2e test edits a heading
from an iPhone-sized viewport and confirms the preview updates.
