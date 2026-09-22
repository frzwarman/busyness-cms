import {
  type BusinessPack,
  buildGlobals,
  buildSitePage,
  type FormTemplateId,
  planSite,
  type SiteDetails,
} from '@siteos/business-packs';
import {
  createForm,
  createGlobal,
  createPage,
  createSite,
  type Db,
  saveDraft,
  slugForSite,
  updateSiteSettings,
} from '@siteos/db';
import type { ThemeTokens } from '@siteos/schemas';

export type CreateSiteInput = {
  pack: BusinessPack;
  details: SiteDetails;
  presetId: string;
  colors?: Partial<ThemeTokens['colors']>;
  pageKeys: string[];
};
export type Progress = (message: string) => void;

/**
 * Turn the wizard's answers into ordinary records: site + settings, forms, empty pages (to get ids), navbar and
 * footer globals linking those pages, then each page's draft built by its recipe. Nothing references the
 * pack afterwards; it is all editable content.
 */
export async function createSiteFromPack(
  db: Db,
  input: CreateSiteInput,
  progress: Progress = () => {},
): Promise<{ siteId: string; homePageId: string }> {
  const { pack, details } = input;
  const plan = planSite(pack, details, {
    presetId: input.presetId,
    colors: input.colors,
    pageKeys: input.pageKeys,
  });
  if (!plan.pages.length) throw new Error('Choose at least one page.');

  progress('Creating your site…');
  const siteId = await createSite(db, {
    name: details.name.trim(),
    slug: slugForSite(details.name),
    theme: plan.theme,
    businessType: pack.id,
  });
  await updateSiteSettings(db, siteId, plan.settings);

  progress('Adding forms…');
  const formIds: Partial<Record<FormTemplateId, string>> = {};
  for (const f of plan.forms) formIds[f.template] = await createForm(db, siteId, f.definition);

  progress('Creating pages…');
  const pageIds: Record<string, string> = {};
  for (const page of plan.pages)
    pageIds[page.key] = await createPage(db, siteId, {
      id: 'pending',
      slug: page.slug,
      title: page.title,
      seo: { noindex: false },
      sections: [],
    });

  progress('Building navigation…');
  const g = buildGlobals(
    pack,
    details,
    plan.pages.map((p) => ({ key: p.key, id: pageIds[p.key] as string, title: p.title })),
  );
  const navbar = await createGlobal(db, siteId, g.navbar.name, g.navbar.section);
  const footer = await createGlobal(db, siteId, g.footer.name, g.footer.section);

  for (const page of plan.pages) {
    progress(`Writing ${page.title}…`);
    const doc = buildSitePage(
      pack,
      details,
      { ...page, id: pageIds[page.key] as string },
      {
        pageIds,
        formIds,
        globals: {
          navbar: { id: navbar.id, section: navbar.section },
          footer: { id: footer.id, section: footer.section },
        },
      },
    );
    await saveDraft(db, pageIds[page.key] as string, 1, doc);
  }
  const homePageId = pageIds.home ?? (Object.values(pageIds)[0] as string);
  return { siteId, homePageId };
}
