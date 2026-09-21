# Asset architecture (Milestone 5 design; image refs exist today)

## Today

Sections reference images as `{ assetId?, src, alt, decorative, width, height, focalX, focalY }`.
The Studio image control edits URL, alt text, the decorative flag and the focal point (click or arrow keys),
and warns when alt text is missing. `Picture.astro` sets `width/height`, `loading`, `fetchpriority`,
`decoding` and maps the focal point to `object-position`.

## Upload flow

1. Browser computes SHA-256 of the file and asks the edge worker whether the site already has it (exact match → offer "use existing").
2. A Web Worker resizes to 1920/960/320 WebP (never upscaling), keeping the original.
3. The worker returns signed PUT URLs for stable keys `/sites/{siteId}/assets/{assetId}/{original|1920|960|320}.{ext}`.
4. The browser uploads to R2 directly; no bytes pass through Supabase.
5. On confirm, the worker writes `assets`, `asset_variants` and computes dimensions server-side from the uploaded bytes.

Constraints enforced server-side: MIME sniffing, size and extension allowlists, SVG sanitized or refused.
R2 write credentials never reach the browser.

## Usage graph

`asset_usages (asset_id, site_id, page_id, section_id, field_path)` is maintained on every draft save by
walking the document for `assetId` fields. "Where is this used?" and delete protection read this table; no
full scan.

## Rendering

`Picture.astro` will emit `srcset`/`sizes` from `asset_variants` so phones never download the 1920px file.
