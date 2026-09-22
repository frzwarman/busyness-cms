import { expect, type Page, test } from '@playwright/test';

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
test.skip(
  !email || !password,
  'Set E2E_EMAIL and E2E_PASSWORD in .env to run the guided creation flow.',
);

async function signIn(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email ?? '');
  await page.getByLabel('Password').fill(password ?? '');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/sites\/[^/]+\/pages\/[^/]+/, { timeout: 30_000 });
}

/** Guided creation: business type → details → style → colors → pages → create. Then a recipe page, then delete the site. */
test('guided site creation builds an editable barbershop site from a pack, then deletes it', async ({
  page,
  request,
}) => {
  await signIn(page);
  const stamp = Date.now().toString(36);
  const name = `Cukur ${stamp}`;

  await page.getByRole('button', { name: 'Account' }).click();
  await page.getByRole('menuitem', { name: 'Create another site' }).click();
  await expect(page).toHaveURL(/\/new-site/);

  // Step 1: business type
  await page.getByRole('button', { name: /^Barbershop/ }).click();
  // Step 2: details
  await expect(page.getByRole('heading', { name: /Tell us about your barbershop/ })).toBeVisible();
  await page.getByLabel('Business name').fill(name);
  await page.getByLabel('Tagline').fill('Sharp cuts, no rush');
  await page.getByLabel('Phone').fill('+62 251 555 0199');
  await page.getByLabel('Email').fill(`hello@cukur-${stamp}.example`);
  await page.getByLabel('Street address').fill('Jl. Suryakencana No. 5');
  await page.getByLabel('City').fill('Bogor');
  await page.getByRole('button', { name: 'Continue' }).click();
  // Step 3: style — the pack suggests Luxury; pick Modern instead to prove it is a suggestion
  await expect(page.getByText(/We suggest Luxury/)).toBeVisible();
  await page.getByRole('button', { name: 'Modern style' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  // Step 4: colors (skip)
  await page.getByRole('button', { name: 'Skip' }).click();
  // Step 5: pages — untick Gallery
  const gallery = page
    .getByRole('list', { name: 'Pages' })
    .getByRole('checkbox', { name: /Gallery/ });
  await expect(gallery).toBeChecked();
  await gallery.uncheck();
  await page.getByRole('button', { name: 'Continue' }).click();
  // Step 6: create
  await expect(page.getByRole('heading', { name: `Ready to create ${name}` })).toBeVisible();
  await expect(page.getByText('Home, Services & prices, Book')).toBeVisible();
  await page.getByRole('button', { name: 'Create site' }).click();
  await expect(page).toHaveURL(/\/sites\/[^/]+\/pages\/[^/]+/, { timeout: 90_000 });

  // The editor shows the generated home page with global navbar/footer and pack content.
  const preview = page.frameLocator('iframe[title="Live preview of the page"]');
  await expect(preview.locator('[data-section-type="hero"] h1')).toContainText('A proper cut', {
    timeout: 30_000,
  });
  await expect(preview.locator('[data-section-type="navbar"]')).toContainText(name);
  await expect(preview.locator('[data-section-type="footer"]')).toContainText('+62 251 555 0199');
  const items = page.getByRole('list', { name: /Page sections/ }).locator('> li');
  await expect(items.first()).toContainText('Global · Navigation bar');
  await expect(items.last()).toContainText('Global · Footer');
  // Pages panel lists the three chosen pages; the theme is Modern (Space Grotesk headings)
  await page.getByRole('button', { name: 'Pages', exact: true }).click();
  const pagesList = page.getByRole('link', { name: /\/services|\/book|Home/ });
  await expect(pagesList).toHaveCount(3);
  await expect
    .poll(() =>
      preview
        .locator('main h1')
        .first()
        .evaluate((e) => getComputedStyle(e).fontFamily),
    )
    .toMatch(/Space Grotesk/);
  // Site settings carry the details into structured data
  await page.getByRole('button', { name: 'Site settings' }).click();
  await expect(page.getByLabel('Business type')).toContainText('Local business');
  await expect(page.getByLabel('Phone')).toHaveValue('+62 251 555 0199');

  // A new page from a recipe reuses the globals and lands in the editor.
  await page.getByRole('button', { name: 'Pages', exact: true }).click();
  await page.getByRole('button', { name: 'New page' }).click();
  await page.getByLabel('Page name').fill('Team');
  await page.getByRole('button', { name: /Build trust/ }).click();
  await page.getByRole('button', { name: 'Create page' }).click();
  await expect(page).toHaveURL(/\/pages\//, { timeout: 30_000 });
  await expect(preview.locator('[data-section-type="team"]')).toBeVisible({ timeout: 30_000 });
  await expect(preview.locator('[data-section-type="navbar"]')).toContainText(name);

  // Section picker opens on "Recommended for you" (pack-aware).
  await page.getByRole('button', { name: 'Sections', exact: true }).click();
  await page.getByRole('button', { name: 'Add section' }).click();
  await expect(page.getByRole('button', { name: 'Recommended for you' })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await page.keyboard.press('Escape');

  // Publish home? Not needed. Clean up: delete the site (owner) — the public route must then 404.
  await page.getByRole('button', { name: 'Site settings' }).click();
  await page.getByLabel(/Type the site name to confirm/).fill(name);
  await page.getByRole('button', { name: 'Delete this site permanently' }).click();
  await expect(page).toHaveURL(/\/sites\/[^/]+\/pages\/[^/]+/, { timeout: 30_000 });
  await expect(page.getByText(name)).toHaveCount(0);
  expect(
    (
      await request.get(`http://localhost:4321/s/${name.toLowerCase().replace(' ', '-')}-x/`)
    ).status(),
  ).toBe(404);
});
