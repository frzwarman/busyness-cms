import { expect, type Page, test } from '@playwright/test';

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
test.skip(!email || !password, 'Set E2E_EMAIL and E2E_PASSWORD in .env to run the content flow.');

async function signIn(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email ?? '');
  await page.getByLabel('Password').fill(password ?? '');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/sites\/[^/]+\/pages\/[^/]+/, { timeout: 30_000 });
}

/** Content library entry → testimonials section sourced by tag → preview shows it → edit entry → preview updates. Cleans up. */
test('content library entries flow into sections and update everywhere', async ({ page }) => {
  await signIn(page);
  const preview = page.frameLocator('iframe[title="Live preview of the page"]');
  await expect(preview.locator('[data-section-type="hero"]')).toBeVisible({ timeout: 30_000 });
  const stamp = Date.now().toString(36);

  // Create an entry with a tag.
  await page.getByRole('tab', { name: 'Content' }).click();
  await page.getByRole('button', { name: 'Add' }).click();
  const list = page.getByRole('list', { name: 'Testimonials' });
  const row = list.getByRole('listitem').filter({ has: page.locator('[aria-expanded="true"]') }); // the newly added entry opens itself
  await row.getByLabel('Quote').fill(`Library quote ${stamp}`);
  await row.getByLabel('Name').fill(`Lib Person ${stamp}`);
  await row.getByLabel('Tags (comma separated)').fill(`e2e-${stamp}`);
  await expect(row.getByText('Saved', { exact: true })).toBeVisible({ timeout: 10_000 });

  // Add a testimonials section and point it at the library by tag.
  await page.getByRole('tab', { name: 'Sections' }).click();
  await page.getByRole('button', { name: 'Add section' }).click();
  await page.getByLabel('Search sections').fill('testimonials');
  await page
    .getByRole('dialog')
    .locator('ul')
    .getByRole('button', { name: /^Testimonials/ })
    .first()
    .click();
  await page.getByRole('button', { name: /^Grid/ }).click();
  await expect(preview.locator('[data-section-type="testimonials"]')).toBeVisible({
    timeout: 15_000,
  });
  await page.getByRole('radio', { name: 'Testimonials', exact: true }).click(); // "Items come from" → library
  await page.getByRole('radio', { name: 'By tag' }).click();
  await page.getByLabel('Tag').fill(`e2e-${stamp}`);
  await expect(preview.locator('[data-section-type="testimonials"] blockquote')).toHaveCount(1, {
    timeout: 15_000,
  });
  await expect(preview.locator('[data-section-type="testimonials"]')).toContainText(
    `Library quote ${stamp}`,
  );
  // manual items list is hidden while sourcing from the library
  await expect(page.getByRole('group', { name: 'Testimonials', exact: true })).toHaveCount(0);

  // Edit the entry: the section updates without touching the section.
  await page.getByRole('tab', { name: 'Content' }).click();
  await list.getByRole('button', { name: new RegExp(`^Lib Person ${stamp}`) }).click();
  await list
    .getByRole('listitem')
    .filter({ hasText: `Lib Person ${stamp}` })
    .getByLabel('Quote')
    .fill(`Updated quote ${stamp}`);
  await expect(preview.locator('[data-section-type="testimonials"]')).toContainText(
    `Updated quote ${stamp}`,
    { timeout: 15_000 },
  );

  // Clean up: remove the section (picked refs none), delete the entry.
  await page.getByRole('tab', { name: 'Sections' }).click();
  await preview.locator('[data-section-type="testimonials"]').click();
  await page.getByRole('button', { name: 'Delete section' }).click();
  await expect(preview.locator('[data-section-type="testimonials"]')).toHaveCount(0, {
    timeout: 15_000,
  });
  await page.getByRole('tab', { name: 'Content' }).click();
  page.once('dialog', (d) => d.accept());
  await list.getByRole('button', { name: `Delete Lib Person ${stamp}` }).click();
  await expect(list.getByRole('button', { name: new RegExp(`Lib Person ${stamp}`) })).toHaveCount(
    0,
    { timeout: 15_000 },
  );
  await expect(page.getByText('Saved', { exact: true }).first()).toBeVisible({ timeout: 10_000 });
});

/** Make a section global, edit it through the global, insert it on another page, detach. Cleans up. */
test('global sections: make global, edit once, insert elsewhere, detach', async ({ page }) => {
  await signIn(page);
  const preview = page.frameLocator('iframe[title="Live preview of the page"]');
  await expect(preview.locator('[data-section-type="cta"]')).toBeVisible({ timeout: 30_000 });
  const stamp = Date.now().toString(36);
  const items = page.getByRole('list', { name: /Page sections/ }).locator('> li');

  // Make the CTA global.
  page.once('dialog', (d) => d.accept(`Footer CTA ${stamp}`));
  await items.nth(2).hover();
  await items
    .nth(2)
    .getByRole('button', { name: /Call to action actions/ })
    .click();
  await page.getByRole('menuitem', { name: 'Make global' }).click();
  await expect(items.nth(2)).toContainText(`Global · Footer CTA ${stamp}`, { timeout: 15_000 });
  await items
    .nth(2)
    .getByRole('button', { name: /Global · Footer CTA/ })
    .click();
  await expect(page.getByRole('status').filter({ hasText: 'Global section' })).toBeVisible();

  // Edit through the global: the page preview updates and the global is saved.
  await page.getByLabel('Heading', { exact: true }).fill(`Global heading ${stamp}`);
  await expect(preview.locator('[data-section-type="cta"] h2')).toHaveText(
    `Global heading ${stamp}`,
    { timeout: 15_000 },
  );
  await expect(page.getByRole('status').filter({ hasText: 'Saved.' })).toBeVisible({
    timeout: 15_000,
  });

  // Insert the global from the picker (creates a second placeholder on this page).
  await page.getByRole('button', { name: 'Add section' }).click();
  await page.getByRole('button', { name: 'Global sections' }).click();
  await page.getByRole('button', { name: new RegExp(`Footer CTA ${stamp}`) }).click();
  await expect(preview.locator('[data-section-type="cta"]')).toHaveCount(2, { timeout: 15_000 });
  await expect(preview.locator('[data-section-type="cta"] h2').nth(1)).toHaveText(
    `Global heading ${stamp}`,
  );

  // Detach the inserted copy: it becomes local and stops following the global.
  await page.getByRole('button', { name: 'Detach from global' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Global section' })).toHaveCount(0);
  await page.getByLabel('Heading', { exact: true }).fill(`Local heading ${stamp}`);
  await expect(preview.locator('[data-section-type="cta"] h2').nth(1)).toHaveText(
    `Local heading ${stamp}`,
    { timeout: 15_000 },
  );
  await expect(preview.locator('[data-section-type="cta"] h2').nth(0)).toHaveText(
    `Global heading ${stamp}`,
  );

  // Clean up: delete the detached copy, detach + restore the original, delete the global.
  await page.getByRole('button', { name: 'Delete section' }).click();
  await expect(preview.locator('[data-section-type="cta"]')).toHaveCount(1, { timeout: 15_000 });
  await preview.locator('[data-section-type="cta"]').click();
  await page.getByRole('button', { name: 'Detach from global' }).click();
  await page.getByLabel('Heading', { exact: true }).fill('Book the corner table');
  await expect(page.getByText('Saved', { exact: true })).toBeVisible({ timeout: 10_000 });
  await page.getByRole('tab', { name: 'Content' }).click();
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: `Delete global Footer CTA ${stamp}` }).click();
  await expect(page.getByRole('button', { name: `Delete global Footer CTA ${stamp}` })).toHaveCount(
    0,
    { timeout: 15_000 },
  );
});
