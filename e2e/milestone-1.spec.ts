import { expect, type FrameLocator, type Page, test } from '@playwright/test';

/** The Milestone 1 definition of done, exercised for real: add, reorder, edit, and see the same content in the live preview. */

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
test.skip(
  !email || !password,
  'Set E2E_EMAIL and E2E_PASSWORD in .env to run the editor flows against Supabase.',
);

/** Sign in, open the first site's home page, and reset the hero heading so tests start from known content. */
async function openEditor(page: Page): Promise<FrameLocator> {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email ?? '');
  await page.getByLabel('Password').fill(password ?? '');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/sites\/[^/]+\/pages\/[^/]+/, { timeout: 30_000 });
  const heading = page.getByLabel('Heading', { exact: true });
  await expect(heading).toBeVisible();
  if ((await heading.inputValue()) !== 'Coffee worth slowing down for') {
    await heading.fill('Coffee worth slowing down for');
    await expect(page.getByText('Saved', { exact: true })).toBeVisible({ timeout: 10_000 });
  }
  const preview = page.frameLocator('iframe[title="Live preview of the page"]');
  await expect(preview.locator('[data-section-type="hero"] h1')).toHaveText(
    'Coffee worth slowing down for',
  );
  return preview;
}

test('edits appear live in the preview and persist as a draft', async ({ page }) => {
  const preview = await openEditor(page);
  const heading = page.getByLabel('Heading', { exact: true });
  await heading.fill('Coffee, but slower');
  await expect(preview.locator('[data-section-type="hero"] h1')).toHaveText('Coffee, but slower');
  await expect(page.getByText('Saved', { exact: true })).toBeVisible({ timeout: 10_000 });

  await page.reload();
  await expect(preview.locator('[data-section-type="hero"] h1')).toHaveText('Coffee, but slower');
});

test('sections can be added, reordered and hidden', async ({ page }) => {
  const preview = await openEditor(page);
  const types = () =>
    preview
      .locator('main [data-section-type]')
      .evaluateAll((els) => els.map((e) => e.getAttribute('data-section-type')));
  expect(await types()).toEqual(['hero', 'image-text', 'cta']);

  // Add a CTA (card layout) after the currently selected hero.
  await page.getByRole('button', { name: 'Add section' }).click();
  await page.getByLabel('Search sections').fill('call to');
  await page.getByRole('button', { name: /Call to action/ }).click();
  await page.getByRole('button', { name: /^Card/ }).click();
  await expect.poll(types).toEqual(['hero', 'cta', 'image-text', 'cta']);

  // Reorder via the accessible menu (drag has a keyboard/menu alternative by design).
  // Direct children only: the selected section nests its inspector groups in a sub-list.
  const items = page.getByRole('list', { name: /Page sections/ }).locator('> li');
  await items.nth(2).hover();
  await items
    .nth(2)
    .getByRole('button', { name: /Image \+ Text actions/ })
    .click();
  await page.getByRole('menuitem', { name: 'Move up' }).click();
  await expect.poll(types).toEqual(['hero', 'image-text', 'cta', 'cta']);

  // Hide the last section: it leaves the preview but stays in the draft.
  await items.nth(3).hover();
  await items
    .nth(3)
    .getByRole('button', { name: /Call to action actions/ })
    .click();
  await page.getByRole('menuitem', { name: 'Hide' }).click();
  await expect.poll(types).toEqual(['hero', 'image-text', 'cta']);
  await expect(items).toHaveCount(4);
});

test('clicking in the preview selects the section and focuses the field', async ({ page }) => {
  const preview = await openEditor(page);
  await preview.locator('[data-section-type="image-text"] h2').click();
  await expect(page.getByRole('heading', { name: 'Image + Text', level: 2 })).toBeVisible();
  await expect(page.getByLabel('Heading', { exact: true })).toBeFocused();
  await expect(preview.locator('[data-section-type="image-text"]')).toHaveClass(/is-selected/);
});

test('variant, theme preset and device switches change the rendered output', async ({ page }) => {
  const preview = await openEditor(page);
  await page.getByRole('button', { name: 'Centered' }).click();
  await expect(preview.locator('[data-section-type="hero"]')).toHaveClass(/v-centered/);

  await page.getByRole('tab', { name: 'Brand' }).click();
  await page.getByRole('button', { name: /^Modern/ }).click();
  await expect
    .poll(() =>
      preview
        .locator('body')
        .evaluate((b) => getComputedStyle(b).getPropertyValue('--color-primary').trim()),
    )
    .toBe('#2563eb');

  await page.getByRole('radio', { name: 'Mobile preview' }).click();
  await expect(page.locator('iframe[title="Live preview of the page"]')).toHaveJSProperty(
    'clientWidth',
    390,
  );
});

test('undo reverts a coalesced typing burst in one step', async ({ page }) => {
  const preview = await openEditor(page);
  const heading = page.getByLabel('Heading', { exact: true });
  await heading.fill('One');
  await heading.fill('One two');
  await page.keyboard.press('ControlOrMeta+z');
  await expect(heading).toHaveValue('Coffee worth slowing down for');
  await expect(preview.locator('[data-section-type="hero"] h1')).toHaveText(
    'Coffee worth slowing down for',
  );
  await page.keyboard.press('ControlOrMeta+Shift+z');
  await expect(heading).toHaveValue('One two');
});

test('the public route renders the same sections without editor scripts', async ({
  page,
  request,
}) => {
  await openEditor(page);
  const openSite = page.getByRole('link', { name: /Open site/ });
  // The link appears once the publish state has loaded; only skip if the site really has nothing live.
  const published = await openSite.waitFor({ timeout: 10_000 }).then(
    () => true,
    () => false,
  );
  if (!published)
    test.skip(true, 'Nothing published yet for this site; covered by milestone-3.spec.ts');
  const res = await request.get((await openSite.getAttribute('href')) as string);
  expect(res.status()).toBe(200);
  const html = await res.text();
  expect(html).toContain('data-section-type="hero"');
  // No editor protocol, preview shell or Studio code leaks into public markup.
  expect(html).not.toContain('siteos:');
  expect(html).not.toContain('/preview');
  expect(html).not.toContain('DRAFT PREVIEW');
});
