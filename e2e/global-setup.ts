import { chromium } from '@playwright/test';

/**
 * Warm both dev servers once: Vite discovers and pre-bundles dependencies on the first page load and
 * reloads the page when it does. Doing that here keeps the actual tests deterministic.
 */
export default async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (let attempt = 0; attempt < 2; attempt++) {
    await page.goto('http://localhost:5180/');
    await page.waitForURL(/\/pages\//, { timeout: 60_000 });
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
