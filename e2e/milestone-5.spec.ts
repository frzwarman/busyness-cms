import { expect, type Page, test } from '@playwright/test';

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
test.skip(!email || !password, 'Set E2E_EMAIL and E2E_PASSWORD in .env to run the asset flow.');

async function signIn(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email ?? '');
  await page.getByLabel('Password').fill(password ?? '');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/sites\/[^/]+\/pages\/[^/]+/, { timeout: 30_000 });
}

/** Upload → resize in a worker → edge → R2 → metadata; use in a section; usage protection; delete. */
test('assets: upload, dedupe, use in hero with srcset, usage protection, delete', async ({
  page,
  context,
  request,
}) => {
  await signIn(page);
  const preview = page.frameLocator('iframe[title="Live preview of the page"]');
  await expect(preview.locator('[data-section-type="hero"]')).toBeVisible({ timeout: 30_000 });

  // A real PNG, unique per run so dedupe doesn't short-circuit the first upload. Drawn in a scratch tab.
  const stamp = Date.now().toString(36);
  const scratch = await context.newPage();
  await scratch.setContent(`<canvas id="c" width="1400" height="900"></canvas>`);
  const dataUrl = await scratch.evaluate((text) => {
    const canvas = document.getElementById('c') as HTMLCanvasElement;
    const c = canvas.getContext('2d') as CanvasRenderingContext2D;
    c.fillStyle = '#7c2d12';
    c.fillRect(0, 0, 1400, 900);
    c.fillStyle = '#fff';
    c.font = '80px sans-serif';
    c.fillText(text, 100, 450);
    return canvas.toDataURL('image/png');
  }, stamp);
  await scratch.close();
  const png = Buffer.from(dataUrl.split(',')[1] as string, 'base64');

  await page.getByRole('button', { name: 'Assets', exact: true }).click();
  const browser = page.getByRole('region', { name: 'Asset browser' });
  const filename = `e2e-${stamp}.png`;
  await browser
    .getByLabel('Upload files')
    .setInputFiles({ name: filename, mimeType: 'image/png', buffer: png });
  const card = browser.getByRole('button', { name: new RegExp(filename) });
  await expect(card).toBeVisible({ timeout: 60_000 });
  await expect(card).toContainText('1400×900');
  const details = page.getByRole('complementary', { name: 'Asset details' });
  // 1400px wide: original + 960 + 320. No 1920 variant because images are never upscaled.
  await expect(details).toContainText('3 files stored');
  await expect(details).toContainText('Missing alt text');
  await details.getByLabel('Alt text', { exact: true }).fill(`Test image ${stamp}`);
  await expect(details.getByText('Saved', { exact: true })).toBeVisible({ timeout: 10_000 });

  // Uploading the same bytes again is detected as a duplicate.
  await browser
    .getByLabel('Upload files')
    .setInputFiles({ name: `copy-${filename}`, mimeType: 'image/png', buffer: png });
  await expect(browser.getByText(/Already in your library/)).toBeVisible({ timeout: 30_000 });
  await browser.getByRole('button', { name: 'Dismiss' }).click();

  // Use it in the hero via the image control → renderer emits srcset with the variants.
  await page.getByRole('button', { name: 'Sections', exact: true }).click();
  await preview.locator('[data-section-type="hero"] h1').click();
  await page.getByRole('button', { name: /Replace from library|Choose image/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Choose an image' });
  await dialog.getByRole('button', { name: new RegExp(filename) }).click();
  await dialog.getByRole('button', { name: 'Use this image' }).click();
  const heroImg = preview.locator('[data-section-type="hero"] img');
  await expect(heroImg).toHaveAttribute('alt', `Test image ${stamp}`, { timeout: 15_000 });
  const srcset = (await heroImg.getAttribute('srcset')) ?? '';
  expect(srcset).toMatch(/320\.webp 320w/);
  expect(srcset).toMatch(/960\.webp 960w/);
  const src = (await heroImg.getAttribute('src')) as string;
  const bytes = await request.get(src);
  expect(bytes.status()).toBe(200);
  expect(bytes.headers()['content-type']).toBe('image/webp');
  expect(bytes.headers()['cache-control']).toMatch(/immutable/);
  await expect(page.getByText('Saved', { exact: true })).toBeVisible({ timeout: 10_000 });

  // Usage tracking: the browser now shows the asset as used, and deletion is refused.
  await page.getByRole('button', { name: 'Assets', exact: true }).click();
  await expect(browser.getByRole('button', { name: new RegExp(filename) })).toContainText(
    'Used in 1',
    { timeout: 15_000 },
  );
  await browser.getByRole('button', { name: new RegExp(filename) }).click();
  await details.getByRole('button', { name: /Delete asset/ }).click();
  await expect(details).toContainText('used in 1 place');
  await details.getByRole('button', { name: 'Cancel' }).click();

  // Remove it from the hero, then delete for real.
  await page.getByRole('button', { name: 'Sections', exact: true }).click();
  await page.getByRole('button', { name: 'Remove image' }).click();
  await expect(page.getByText('Saved', { exact: true })).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'Assets', exact: true }).click();
  await expect(browser.getByRole('button', { name: new RegExp(filename) })).not.toContainText(
    'Used in',
    { timeout: 15_000 },
  );
  await browser.getByRole('button', { name: new RegExp(filename) }).click();
  await details.getByRole('button', { name: /Delete asset/ }).click();
  await details.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(browser.getByRole('button', { name: new RegExp(filename) })).toHaveCount(0, {
    timeout: 15_000,
  });
  expect((await request.get(src)).status()).toBe(404);
});

test('edge worker refuses unauthenticated and cross-origin misuse', async ({ request }) => {
  expect(
    (await request.post('http://localhost:8787/uploads/authorize', { data: {} })).status(),
  ).toBe(401);
  expect(
    (await request.put('http://localhost:8787/uploads/x/original', { data: 'x' })).status(),
  ).toBe(401);
  expect((await request.get('http://localhost:8787/assets/../../etc/passwd')).status()).toBe(404);
  expect(
    (await request.get('http://localhost:8787/assets/sites/x/assets/y/original.png')).status(),
  ).toBe(404);
});
