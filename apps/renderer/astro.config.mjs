// @ts-check
import cloudflare from '@astrojs/cloudflare';
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  // CSRF: Astro rejects cross-origin POSTs by default; the preview render route relies on this.
  security: { checkOrigin: true },
  vite: {
    // Workspace packages ship .astro/.ts source; keep them in the SSR bundle so Vite compiles them.
    ssr: { noExternal: ['@siteos/sections', '@siteos/schemas', '@siteos/design-system'] },
  },
});
