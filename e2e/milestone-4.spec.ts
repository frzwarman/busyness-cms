import { expect, test } from '@playwright/test';

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
test.skip(
  !email || !password,
  'Set E2E_EMAIL and E2E_PASSWORD in .env to run the section library flow.',
);

/** Section library controls: rich text (with v1→v2 migration), lists, nested lists, icon picker. Cleans up after itself. */
test('rich text, list, nested list and icon controls work end to end', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));
  await page.goto('/login');
  await page.getByLabel('Email').fill(email ?? '');
  await page.getByLabel('Password').fill(password ?? '');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/sites\//, { timeout: 30_000 });
  const preview = page.frameLocator('iframe[title="Live preview of the page"]');
  await expect(preview.locator('main [data-section-type]').first()).toBeVisible({
    timeout: 30_000,
  });

  // Image+Text v1 in the DB migrates to v2 and shows the rich text editor
  await preview.locator('[data-section-type="image-text"] h2').click();
  await expect(page.getByRole('toolbar', { name: 'Formatting' })).toBeVisible();
  await expect(preview.locator('[data-section-type="image-text"] .prose p').first()).toBeVisible();

  // Add FAQ from the picker; list control + nested rich text render
  await page.getByRole('button', { name: 'Add section' }).click();
  await page.getByLabel('Search sections').fill('faq');
  await page
    .getByRole('dialog')
    .locator('main, ul')
    .getByRole('button', { name: /^FAQ/ })
    .first()
    .click();
  await page.getByRole('button', { name: /^Accordion/ }).click();
  await expect(preview.locator('[data-section-type="faq"] details').first()).toBeVisible({
    timeout: 15_000,
  });
  const group = page.getByRole('group', { name: 'Questions' });
  await expect(group.getByRole('button', { name: /^Do you take reservations/ })).toBeVisible();
  await group.getByRole('button', { name: 'Add question' }).click();
  await expect(preview.locator('[data-section-type="faq"] details')).toHaveCount(4, {
    timeout: 15_000,
  });
  await group.getByRole('button', { name: 'Remove question 4' }).click();
  await expect(preview.locator('[data-section-type="faq"] details')).toHaveCount(3, {
    timeout: 15_000,
  });

  // Menu: nested lists
  await page.getByRole('button', { name: 'Add section' }).click();
  await page.getByLabel('Search sections').fill('menu');
  await page
    .getByRole('dialog')
    .locator('ul')
    .getByRole('button', { name: /^Menu/ })
    .first()
    .click();
  await page.getByRole('button', { name: /^Columns/ }).click();
  await expect(preview.locator('[data-section-type="menu"] .group')).toHaveCount(2, {
    timeout: 15_000,
  });
  await page
    .getByRole('group', { name: 'Categories' })
    .getByRole('button', { name: /^Coffee/ })
    .click();
  await expect(
    page.getByRole('group', { name: 'Dishes' }).getByRole('button', { name: /^Flat white/ }),
  ).toBeVisible();

  // Feature grid: icon picker
  await page.getByRole('button', { name: 'Add section' }).click();
  await page.getByLabel('Search sections').fill('features');
  await page
    .getByRole('dialog')
    .locator('ul')
    .getByRole('button', { name: /^Features/ })
    .first()
    .click();
  await page.getByRole('button', { name: /^Bento/ }).click();
  await expect(preview.locator('[data-section-type="feature-grid"] svg')).toHaveCount(3, {
    timeout: 15_000,
  });
  await page
    .getByRole('group', { name: 'Features' })
    .getByRole('button', { name: /^Fast turnaround/ })
    .click();
  await page.getByRole('button', { name: /^zap$/i }).click();
  await page.getByRole('button', { name: 'coffee', exact: true }).click();

  // clean up: delete the three added sections so the e2e site stays as the suite expects
  for (const t of ['feature-grid', 'menu', 'faq']) {
    await preview.locator(`[data-section-type="${t}"]`).first().click();
    await page.getByRole('button', { name: 'Delete section' }).click();
  }
  await expect(preview.locator('main [data-section-type]')).toHaveCount(3, { timeout: 15_000 });
  await expect(page.getByText('Saved', { exact: true })).toBeVisible({ timeout: 10_000 });
  expect(errors, errors.join('\n')).toEqual([]);
});
