# Asset architecture

Bytes live in Cloudflare R2, metadata in Postgres, and no R2 credential ever reaches a browser.

## Upload flow (built)

```text
Browser                          Edge worker (apps/edge)                 R2 / Postgres
─────────────────────────────    ────────────────────────────────────    ─────────────────────
SHA-256 the file
Web Worker: decode once, emit
  WebP at 1920/960/320 (never
  upscaling; no UI freeze)
POST /uploads/authorize ───────► verify Supabase token; check site role
                                 look up (site_id, sha256) ──────────► assets (under the user's RLS)
                                 ◄ duplicate → "use existing"
                                 ◄ else: assetId + signed ticket
PUT /uploads/:id/:variant ─────► verify ticket (HMAC, 15 min), sniff
  × per variant                  magic bytes vs declared type,
                                 stream to key derived from ids ─────► sites/{site}/assets/{id}/{variant}.{ext}
POST /uploads/:id/complete ────► HEAD every variant, then
                                 rpc/create_asset with the user's ──► assets + asset_variants (+ audit log)
                                 token; on failure delete the bytes
```

- Allowed types: JPEG, PNG, WebP, GIF, PDF. **SVG is refused** until a sanitizer exists. Max 25 MB.
- The ticket, not the URL, decides where bytes land; a client cannot write outside its site prefix.
- Duplicate detection hashes the bytes (`unique (site_id, sha256)`), never the filename.

## Serving

`GET /assets/<key>` on the worker serves objects with `Cache-Control: immutable` and ETags. When you have an R2
public bucket or custom domain, point `VITE_ASSET_BASE_URL` (Studio) and `PUBLIC_ASSET_BASE_URL` (worker) at it and
the worker route becomes unused. Keys are immutable, so long cache lifetimes are safe.

## Image references

Sections store `{ assetId, src, alt, decorative, width, height, focalX, focalY, sources[] }`. `sources` (width → URL)
is filled from the asset's variants when the image is chosen, so `Picture.astro` emits `srcset`/`sizes` with zero
database work at render time and published versions stay self-contained. Alt text and focal point are copied from the
asset at pick time and can be overridden per placement.

## Usage graph

`asset_usages(asset_id, page_id, section_id, kind)` is rebuilt by `save_page_draft` (kind `draft`) and `publish_page`
(kind `published`) by walking the document for `assetId` fields (`jsonb_path_query … '$.**.assetId'`). The browser shows
"Used in N" badges and "Where is this used?" from this table; nothing scans documents at read time.

## Deletion

`delete_asset(id, force)` refuses with `asset_in_use` while usages exist. Admins may force it. It returns the R2 keys;
the Studio then asks the worker to delete the objects. Deleting a page cascades its usages.

## Deploying

R2 must be enabled on the Cloudflare account (Dashboard → R2). Then:

```bash
pnpm dlx wrangler r2 bucket create siteos-assets
cd apps/edge
pnpm dlx wrangler secret put UPLOAD_SIGNING_SECRET     # long random string
# set SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY / STUDIO_ORIGIN in wrangler.jsonc vars
pnpm deploy
```

Locally, `wrangler dev` uses an in-process R2 simulation and reads secrets from `apps/edge/.dev.vars`.
