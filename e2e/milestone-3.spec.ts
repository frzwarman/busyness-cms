import { expect, type Page, test } from '@playwright/test';

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
test.skip(
  !email || !password,
  'Set E2E_EMAIL and E2E_PASSWORD in .env to run the publishing flow.',
);

/** Draft → publish → live; draft changes stay private until the next publish; restore brings an old version back. */
async function signIn(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email ?? '');
  await page.getByLabel('Password').fill(password ?? '');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/sites\/[^/]+\/pages\/[^/]+/, { timeout: 30_000 });
}

async function setHeading(page: Page, text: string) {
  const heading = page.getByLabel('Heading', { exact: true });
  await heading.fill(text);
  await expect(page.getByText('Saved', { exact: true })).toBeVisible({ timeout: 10_000 });
}

async function publish(page: Page, note: string) {
  await page.getByRole('button', { name: /^Publish/ }).click();
  await page.getByLabel('Note (optional)').fill(note);
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Publish' }).click();
  await expect(dialog.getByText(/Version \d+ is live/)).toBeVisible({ timeout: 20_000 });
  await dialog.getByRole('button', { name: 'Done' }).click();
}

test('publishing controls what visitors see; drafts stay private; restore works', async ({
  page,
  request,
}) => {
  await signIn(page);
  const stamp = Date.now().toString(36);
  const liveText = `Live ${stamp}`;
  const draftText = `Draft ${stamp}`;

  await setHeading(page, liveText);
  await publish(page, 'e2e publish 1');

  const openSite = page.getByRole('link', { name: /Open site/ });
  await expect(openSite).toBeVisible();
  const publicUrl = (await openSite.getAttribute('href')) as string;
  const apiUrl = publicUrl.replace(/\/s\/([^/]+)\/?$/, '/api/content/sites/$1/pages/');

  let res = await request.get(publicUrl);
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain(liveText);
  expect(res.headers()['cache-control']).toMatch(/s-maxage/);
  expect(res.headers().etag).toBeTruthy();

  // Change the draft: live site and content API must not move.
  await setHeading(page, draftText);
  res = await request.get(publicUrl);
  expect(await res.text()).toContain(liveText);
  expect(await res.text()).not.toContain(draftText);
  const api = await request.get(apiUrl);
  expect(api.status()).toBe(200);
  const json = await api.json();
  expect(JSON.stringify(json)).toContain(liveText);
  expect(JSON.stringify(json)).not.toContain(draftText);
  const etag = api.headers().etag;
  const cached = await request.get(apiUrl, { headers: { 'If-None-Match': etag } });
  expect(cached.status()).toBe(304);

  // Publish the draft: live updates.
  await publish(page, 'e2e publish 2');
  res = await request.get(publicUrl);
  expect(await res.text()).toContain(draftText);

  // Restore the previous version into the draft; live is untouched until published.
  await page.getByRole('button', { name: 'Version history' }).click();
  page.once('dialog', (d) => d.accept());
  const history = page.getByRole('dialog', { name: /Version history/ });
  const restoreButtons = history.getByRole('button', { name: /Restore to draft/ });
  await expect(restoreButtons.nth(1)).toBeVisible(); // versions accumulate across runs; row 2 = previous version
  await restoreButtons.nth(1).click();
  await expect(page.getByLabel('Heading', { exact: true })).toHaveValue(liveText, {
    timeout: 20_000,
  });
  res = await request.get(publicUrl);
  expect(await res.text()).toContain(draftText);
});

test('unpublished sites and unknown pages are 404 on public routes and the API', async ({
  request,
}) => {
  expect((await request.get('http://localhost:4321/s/no-such-site-zz/')).status()).toBe(404);
  expect(
    (await request.get('http://localhost:4321/api/content/sites/no-such-site-zz')).status(),
  ).toBe(404);
  expect((await request.get("http://localhost:4321/s/bad'slug/")).status()).toBe(404);
});
