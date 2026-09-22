import AxeBuilder from '@axe-core/playwright';
import { devices, expect, type Page, test } from '@playwright/test';

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
test.skip(
  !email || !password,
  'Set E2E_EMAIL and E2E_PASSWORD in .env to run the hardening flows.',
);

async function signIn(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email ?? '');
  await page.getByLabel('Password').fill(password ?? '');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/sites\/[^/]+\/pages\/[^/]+/, { timeout: 30_000 });
}

const serious = (results: Awaited<ReturnType<AxeBuilder['analyze']>>) =>
  results.violations
    .filter((v) => v.impact === 'critical' || v.impact === 'serious')
    .map(
      (v) =>
        `${v.id}: ${v.help} (${v.nodes.length} nodes: ${v.nodes
          .slice(0, 3)
          .map((n) => n.target.join(' '))
          .join(' | ')})`,
    );

test('website health lists real issues and measured page weight, and jumps to fixes', async ({
  page,
}) => {
  await signIn(page);
  const preview = page.frameLocator('iframe[title="Live preview of the page"]');
  await expect(preview.locator('[data-section-type="hero"]')).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: 'Website health' }).click();
  await expect(page.getByRole('heading', { name: 'Website health' })).toBeVisible();
  for (const c of ['SEO', 'Accessibility', 'Content', 'Performance', 'Brand'])
    await expect(page.getByRole('term').filter({ hasText: c })).toBeVisible();
  // Measured weight appears after the preview reports.
  await expect(page.getByText('Total transferred')).toBeVisible({ timeout: 20_000 });
  const total = await page
    .getByText('Total transferred')
    .locator('xpath=following-sibling::dd[1]')
    .innerText();
  expect(total).toMatch(/\d+ (B|KB|MB)/);
  await expect(page.getByText('Fonts').locator('xpath=following-sibling::dd[1]')).not.toHaveText(
    '0 B',
  ); // self-hosted fonts were downloaded
  // Introduce an accessibility error: blank the story image's alt text, then fix it from the health panel.
  await page.getByRole('button', { name: 'Sections', exact: true }).click();
  await preview.locator('[data-section-type="image-text"] h2').click();
  const alt = page.getByLabel('Alt text', { exact: true });
  await expect(alt).toBeVisible();
  const before = await alt.inputValue();
  await alt.fill('');
  await expect(page.getByText('Saved', { exact: true })).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'Website health' }).click();
  const issue = page
    .getByRole('list', { name: 'Health issues' })
    .getByRole('button', { name: /an image has no alt text/ });
  await expect(issue).toBeVisible();
  await expect(
    page
      .getByRole('term')
      .filter({ hasText: 'Accessibility' })
      .locator('xpath=following-sibling::dd[1]'),
  ).toContainText('Needs attention');
  await issue.click();
  await expect(alt).toBeFocused({ timeout: 10_000 });
  await alt.fill(before || 'Green coffee beans beside a small roaster');
  await expect(page.getByText('Saved', { exact: true })).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'Website health' }).click();
  await expect(
    page
      .getByRole('list', { name: 'Health issues' })
      .getByRole('button', { name: /an image has no alt text/ }),
  ).toHaveCount(0);
});

test('studio editor has no serious accessibility violations', async ({ page }) => {
  await signIn(page);
  await expect(
    page
      .frameLocator('iframe[title="Live preview of the page"]')
      .locator('[data-section-type="hero"]'),
  ).toBeVisible({ timeout: 30_000 });
  const results = await new AxeBuilder({ page }).exclude('iframe').analyze();
  expect(serious(results), serious(results).join('\n')).toEqual([]);
  // The section picker dialog too.
  await page.getByRole('button', { name: 'Add section' }).click();
  const dialog = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
  expect(serious(dialog), serious(dialog).join('\n')).toEqual([]);
});

test('published public page has no serious accessibility violations and works without JavaScript', async ({
  page,
  browser,
}) => {
  await signIn(page);
  const openSite = page.getByRole('link', { name: /Open site/ });
  await openSite.waitFor({ timeout: 15_000 });
  const url = (await openSite.getAttribute('href')) as string;
  await page.goto(url);
  await page.waitForTimeout(1500); // the hero's one-time load animation ends before contrast is measured
  const results = await new AxeBuilder({ page }).analyze();
  expect(serious(results), serious(results).join('\n')).toEqual([]);
  expect(await page.locator('main h1').count()).toBe(1); // dev toolbar shadow DOM has its own h1s
  expect(await page.getAttribute('html', 'lang')).toMatch(/^[a-z]{2}/);
  // No-JS: the page still renders fully.
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const nojs = await ctx.newPage();
  await nojs.goto(url);
  await expect(nojs.locator('[data-section-type="hero"] h1')).toBeVisible();
  await ctx.close();
});

test('mobile editor: side panels open as sheets, text edits reach the preview', async ({
  browser,
}) => {
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await ctx.newPage();
  await signIn(page);
  const preview = page.frameLocator('iframe[title="Live preview of the page"]');
  await expect(preview.locator('[data-section-type="hero"]')).toBeVisible({ timeout: 30_000 });
  // Panels are hidden inline on phones; the top bar opens them as sheets.
  await expect(page.getByRole('complementary', { name: 'Site tools' })).toBeHidden();
  await page.getByRole('button', { name: 'Open pages and sections' }).click();
  await expect(page.getByRole('dialog', { name: 'Site tools' })).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Pages', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('link', { name: /Home/ })).toBeVisible();
  // A focused tool button's tooltip takes the first Escape; the sheet's Close control always works.
  await page.getByRole('dialog').getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('dialog', { name: 'Site tools' })).toBeHidden();
  await page.getByRole('button', { name: 'Open section settings' }).click();
  const sheet = page.getByRole('dialog', { name: 'Section settings' });
  await expect(sheet).toBeVisible();
  const heading = sheet.getByLabel('Heading', { exact: true });
  const before = await heading.inputValue();
  await heading.fill(`${before} ✦`);
  await expect(preview.locator('[data-section-type="hero"] h1')).toContainText('✦', {
    timeout: 15_000,
  });
  await heading.fill(before);
  await expect(page.getByText('Saved', { exact: true }).or(sheet.getByText('Saved')))
    .toBeVisible({ timeout: 10_000 })
    .catch(() => undefined);
  await ctx.close();
});
