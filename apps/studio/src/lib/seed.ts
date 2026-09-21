import { createPage, type Db } from '@siteos/db';
import type { PageDocument } from '@siteos/schemas';
import { demoAboutPage, demoHomePage } from '@siteos/sections/fixtures';

/**
 * Seed a new site with the demo pages. Fixture links reference fixture page ids, so pages are created
 * in dependency order and ids are rewritten. Business packs (Milestone 8) replace this with real recipes.
 */
export async function seedDemoPages(db: Db, siteId: string): Promise<string> {
  const aboutId = await createPage(db, siteId, demoAboutPage);
  const home = remapPageIds(demoHomePage, { [demoAboutPage.id]: aboutId });
  return createPage(db, siteId, home);
}

function remapPageIds(doc: PageDocument, map: Record<string, string>): PageDocument {
  const json = JSON.stringify(doc);
  const replaced = Object.entries(map).reduce(
    (s, [from, to]) => s.replaceAll(`"pageId":"${from}"`, `"pageId":"${to}"`),
    json,
  );
  return JSON.parse(replaced) as PageDocument;
}
