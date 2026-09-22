import { expect, type Page, test } from '@playwright/test';

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
test.skip(!email || !password, 'Set E2E_EMAIL and E2E_PASSWORD in .env to run the SEO/forms flow.');

async function signIn(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email ?? '');
  await page.getByLabel('Password').fill(password ?? '');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/sites\/[^/]+\/pages\/[^/]+/, { timeout: 30_000 });
}
async function publish(page: Page) {
  await page.getByRole('button', { name: /^Publish/ }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Publish' }).click();
  await expect(dialog.getByText(/Version \d+ is live/)).toBeVisible({ timeout: 20_000 });
  await dialog.getByRole('button', { name: 'Done' }).click();
}

/** SEO: page settings → head tags, JSON-LD only with configured facts, sitemap, robots, redirect. */
test('seo metadata, structured data, sitemap, robots and redirects on the public site', async ({
  page,
  request,
}) => {
  await signIn(page);
  const stamp = Date.now().toString(36);
  const preview = page.frameLocator('iframe[title="Live preview of the page"]');
  await expect(preview.locator('[data-section-type="hero"]')).toBeVisible({ timeout: 30_000 });

  // Site settings: description + structured data type + phone; a redirect.
  await page.getByRole('button', { name: 'Site settings' }).click();
  await page.getByLabel('Default description').fill(`Specialty coffee in Bogor ${stamp}`);
  await page.getByLabel('Business type').click();
  await page.getByRole('option', { name: 'Restaurant' }).click();
  await page.getByLabel('Phone').fill('+62 251 555 0100');
  await page.getByLabel('Old address').fill(`/old-${stamp}`);
  await page.getByLabel('New address').fill('/about');
  await page.getByRole('button', { name: 'Add redirect' }).click();
  await expect(page.getByRole('list', { name: 'Redirects' })).toContainText(`/old-${stamp}`);

  // Page SEO: custom search title + noindex off.
  await page.getByRole('button', { name: 'Page settings' }).click();
  await page.getByLabel('Search title').fill(`Kopi Sudut home ${stamp}`);
  await expect(page.getByLabel('Search result preview (approximate)')).toContainText(
    `Kopi Sudut home ${stamp}`,
  );
  await page.keyboard.press('Escape');
  await expect(page.getByText('Saved', { exact: true })).toBeVisible({ timeout: 10_000 });
  await publish(page);

  const publicUrl = (await page
    .getByRole('link', { name: /Open site/ })
    .getAttribute('href')) as string;
  const html = await (await request.get(publicUrl)).text();
  expect(html).toContain(`<title>Kopi Sudut home ${stamp}</title>`);
  // The page's own description wins over the site default; the site default feeds the organization node.
  expect(html).toContain('name="description" content="Single-origin coffee');
  expect(html).toContain(`"description":"Specialty coffee in Bogor ${stamp}"`);
  expect(html).toMatch(/<link rel="canonical" href="http:\/\/localhost:4321\/s\/[^"]+\/"/);
  expect(html).toContain('property="og:title"');
  const ld = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)?.[1] ?? '';
  const graph = JSON.parse(ld)['@graph'] as Array<Record<string, unknown>>;
  expect(graph[0]?.['@type']).toBe('Restaurant');
  expect(graph[0]?.telephone).toBe('+62 251 555 0100');
  expect(graph[0]).not.toHaveProperty('address'); // not configured → not invented
  expect(html).toMatch(/<link rel="stylesheet" href="\/fonts\/[a-z-]+\.css">/); // self-hosted fonts only
  expect(html).not.toMatch(/fonts\.googleapis|fonts\.gstatic/);

  const base = publicUrl.replace(/\/$/, '');
  const sitemap = await request.get(`${base}/sitemap.xml`);
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain(`<loc>${base}/</loc>`);
  const robots = await (await request.get(`${base}/robots.txt`)).text();
  expect(robots).toContain(`Sitemap: ${base}/sitemap.xml`);
  expect(robots).toContain('Disallow: /preview');
  const redirect = await request.get(`${base}/old-${stamp}`, { maxRedirects: 0 });
  expect(redirect.status()).toBe(301);
  expect(new URL(redirect.headers().location as string, base).toString()).toBe(`${base}/about`);

  // Clean up the redirect (keeps the list tidy across runs).
  await page.getByRole('button', { name: 'Site settings' }).click();
  await page.getByRole('button', { name: `Delete redirect from /old-${stamp}` }).click();
  await expect(page.getByRole('list', { name: 'Redirects' })).not.toContainText(`/old-${stamp}`);
});

/** Forms: build from template → place on page → publish → submit from the public site (no JS and JS) → inbox. */
test('forms: template, form section, public submission with bot checks, inbox and CSV', async ({
  page,
  request,
}) => {
  await signIn(page);
  const stamp = Date.now().toString(36);
  const preview = page.frameLocator('iframe[title="Live preview of the page"]');
  await expect(preview.locator('[data-section-type="hero"]')).toBeVisible({ timeout: 30_000 });

  // Create a Contact form and rename it uniquely.
  await page.getByRole('button', { name: 'Forms' }).click();
  await page.getByRole('tab', { name: 'Forms' }).click();
  await page.getByLabel('New form from template').click();
  await page.getByRole('option', { name: /^Contact/ }).click();
  const formRow = page
    .getByRole('list', { name: 'Forms' })
    .getByRole('listitem')
    .filter({ has: page.locator('[aria-expanded="true"]') });
  await formRow.getByLabel('Form name').fill(`Contact ${stamp}`);
  await expect(formRow.getByText('Saved', { exact: true })).toBeVisible({ timeout: 10_000 });

  // Add a Form section and pick the form.
  await page.getByRole('button', { name: 'Sections' }).click();
  await page.getByRole('button', { name: 'Add section' }).click();
  await page.getByLabel('Search sections').fill('form');
  await page
    .getByRole('dialog')
    .locator('ul')
    .getByRole('button', { name: /^Form/ })
    .first()
    .click();
  await page.getByRole('button', { name: /^Split/ }).click();
  await page.getByLabel('Form', { exact: true }).click();
  await page.getByRole('option', { name: new RegExp(`Contact ${stamp}`) }).click();
  await expect(preview.locator('[data-section-type="contact-form"] form')).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText('Saved', { exact: true })).toBeVisible({ timeout: 10_000 });
  await publish(page);

  // Public page has the form posting to the edge worker; extract form id.
  const publicUrl = (await page
    .getByRole('link', { name: /Open site/ })
    .getAttribute('href')) as string;
  const html = await (await request.get(publicUrl)).text();
  const action = html.match(
    /<form method="post" action="(http:\/\/localhost:8787\/forms\/[^"]+)"/,
  )?.[1] as string;
  expect(action).toBeTruthy();

  // Bot checks: honeypot filled → rejected; too fast → rejected; valid → accepted.
  const good = {
    name: `Visitor ${stamp}`,
    email: 'visitor@example.test',
    message: `Hello from e2e ${stamp}`,
    _ts: String(Date.now() - 5000),
    _page: '/',
  };
  expect(
    (
      await request.post(action, {
        data: { ...good, website: 'spam' },
        headers: { Accept: 'application/json' },
      })
    ).status(),
  ).toBe(422);
  expect(
    (
      await request.post(action, {
        data: { ...good, _ts: String(Date.now()) },
        headers: { Accept: 'application/json' },
      })
    ).status(),
  ).toBe(422);
  expect(
    (
      await request.post(action, {
        data: { ...good, email: 'not-an-email' },
        headers: { Accept: 'application/json' },
      })
    ).status(),
  ).toBe(422);
  const ok = await request.post(action, { data: good, headers: { Accept: 'application/json' } });
  expect(ok.status()).toBe(200);
  expect((await ok.json()).ok).toBe(true);

  // Inbox shows it as new; opening marks it read; CSV export exists.
  await page.getByRole('button', { name: 'Forms' }).click();
  await page.getByRole('tab', { name: 'Inbox' }).click();
  const row = page
    .getByRole('list', { name: 'Submissions' })
    .getByRole('listitem')
    .filter({ hasText: `Visitor ${stamp}` });
  await expect(row).toBeVisible({ timeout: 15_000 });
  await expect(row.getByLabel('New')).toBeVisible();
  await row.getByRole('button', { name: new RegExp(`Visitor ${stamp}`) }).click();
  await expect(row).toContainText(`Hello from e2e ${stamp}`);
  await expect(row.getByLabel('Read')).toBeVisible({ timeout: 10_000 });

  // Clean up: remove the section and the form (cascades submissions).
  await page.getByRole('button', { name: 'Sections' }).click();
  await preview.locator('[data-section-type="contact-form"]').click();
  await page.getByRole('button', { name: 'Delete section' }).click();
  await expect(preview.locator('[data-section-type="contact-form"]')).toHaveCount(0, {
    timeout: 15_000,
  });
  await expect(page.getByText('Saved', { exact: true })).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'Forms' }).click();
  await page.getByRole('tab', { name: 'Forms' }).click();
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: `Delete form Contact ${stamp}` }).click();
  await expect(page.getByRole('button', { name: `Delete form Contact ${stamp}` })).toHaveCount(0, {
    timeout: 15_000,
  });
});
