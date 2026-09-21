import { chromium } from '@playwright/test';

/**
 * Warm both dev servers once: Vite discovers and pre-bundles dependencies on the first page load and
 * reloads the page when it does. Doing that here keeps the actual tests deterministic.
 */
export default async function globalSetup() {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (let attempt = 0; attempt < 2; attempt++) {
    await page.goto('http://localhost:5180/login');
    // A signed-in session (second pass) is redirected straight to the editor.
    await Promise.race([
      page.getByLabel('Email').waitFor({ timeout: 60_000 }),
      page.waitForURL(/\/sites\//, { timeout: 60_000 }),
    ]);
    if (page.url().endsWith('/login')) {
      if (!email || !password) break; // login page warmed; editor flows are skipped without credentials
      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Password').fill(password);
      await page.getByRole('button', { name: 'Sign in' }).click();
      await page.waitForURL(/\/(sites\/[^/]+\/pages\/|new-site)/, { timeout: 60_000 });
      if (page.url().includes('/new-site')) {
        await page.getByLabel('Business name').fill('Kopi Sudut');
        await page.getByRole('button', { name: 'Create site' }).click();
        await page.waitForURL(/\/sites\/[^/]+\/pages\//, { timeout: 60_000 });
      }
    }
    await page
      .frameLocator('iframe[title="Live preview of the page"]')
      .locator('main [data-section-type]')
      .first()
      .waitFor({ timeout: 60_000 });
    await page.getByRole('button', { name: 'Add section' }).click();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1500);
  }
  await browser.close();
}
