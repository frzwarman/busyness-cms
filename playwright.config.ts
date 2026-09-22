import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

/** E2E against the local Studio + renderer dev servers. Both are started automatically. */
export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  // The suite signs in as one user and edits one site, so specs must not run concurrently.
  workers: 1,
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:5180', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'pnpm --filter @siteos/renderer dev:ci',
      url: 'http://localhost:4321/preview',
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: 'pnpm --filter @siteos/edge dev',
      url: 'http://localhost:8787/health',
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: 'pnpm --filter @siteos/studio dev',
      url: 'http://localhost:5180',
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
