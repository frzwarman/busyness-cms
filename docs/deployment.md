# Deployment

## Local development

```bash
pnpm install
cp .env.example .env
pnpm dev
```

| App | URL | Env |
|-----|-----|-----|
| Studio | http://localhost:5180 | `VITE_PREVIEW_ORIGIN=http://localhost:4321` |
| Renderer | http://localhost:4321 | `PUBLIC_STUDIO_ORIGIN=http://localhost:5180` |

| Edge worker | http://localhost:8787 | `apps/edge/.dev.vars` (copy from `.dev.vars.example`), `VITE_EDGE_ORIGIN`, `VITE_ASSET_BASE_URL` |

Both origins must match exactly or the preview refuses messages by design.

## Production targets

| Piece | Where | Command |
|-------|-------|---------|
| Studio | Cloudflare Workers static assets (or Pages) | `pnpm --filter @siteos/studio build` → `apps/studio/dist` |
| Renderer | Cloudflare Worker via `@astrojs/cloudflare` | `pnpm --filter @siteos/renderer build` → `apps/renderer/dist` then `wrangler deploy` |
| Edge | Cloudflare Worker | `cd apps/edge && pnpm deploy` (after `wrangler secret put UPLOAD_SIGNING_SECRET`; optionally `CF_ZONE_ID` var + `wrangler secret put CF_API_TOKEN` for purge-on-publish) |
| Assets | R2 bucket `siteos-assets` | enable R2 in the dashboard, then `wrangler r2 bucket create siteos-assets` |
| Content (M2) | Supabase project | `supabase db push` migrations |

Set `PUBLIC_STUDIO_ORIGIN` to the Studio's production origin and `VITE_PREVIEW_ORIGIN` to the renderer's.

## Free-tier assumptions

- Cloudflare Workers free plan: 100k requests/day. Published pages are cacheable; preview renders are only
  triggered by editors.
- R2 free tier: 10 GB storage, 1M Class A ops/month. Browser-side resizing means one upload per variant, no
  server transforms per request.
- Supabase free tier: 500 MB database, paused after inactivity. Published snapshots are small JSON rows.

These limits are fine for a handful of small businesses. They are not a promise the system stays free at scale.

## Remaining steps without credentials

Cloudflare and Supabase accounts are not part of this repository. Everything runs locally; deployment needs
`wrangler login`, a Supabase project URL/publishable key, and an R2 bucket, then the env values above.
