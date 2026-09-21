import fs from 'node:fs';
import { defineConfig } from 'vitest/config';

export default defineConfig({ test: { env: loadRootEnv(), testTimeout: 30_000 } });

/** Read the repo-root .env so RLS tests can reach the project without extra tooling. */
function loadRootEnv(): Record<string, string> {
  try {
    const text = fs.readFileSync(new URL('../../.env', import.meta.url), 'utf8');
    return Object.fromEntries(
      text
        .split('\n')
        .filter((l) => /^[A-Z_]+=/.test(l))
        .map((l) => {
          const i = l.indexOf('=');
          return [l.slice(0, i), l.slice(i + 1).trim()];
        }),
    );
  } catch {
    return {};
  }
}
