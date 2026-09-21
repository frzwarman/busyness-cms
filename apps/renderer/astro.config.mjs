// @ts-check
import { fileURLToPath } from 'node:url';
import cloudflare from '@astrojs/cloudflare';
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  // CSRF: Astro rejects cross-origin POSTs by default; the preview render route relies on this.
  security: { checkOrigin: true },
  vite: {
    // One .env at the repo root serves every app.
    envDir: fileURLToPath(new URL('../..', import.meta.url)),
    // Workspace packages ship .astro/.ts source; keep them in the SSR bundle so Vite compiles them.
    ssr: { noExternal: ['@siteos/sections', '@siteos/schemas', '@siteos/design-system'] },
  },
});
