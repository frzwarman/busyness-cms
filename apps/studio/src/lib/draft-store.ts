import {
  type PageDocument,
  type PageSummary,
  pageDocumentSchema,
  type ThemeTokens,
  themeTokensSchema,
} from '@siteos/schemas';
import { demoAboutPage, demoHomePage, demoTheme } from '@siteos/sections/fixtures';
import { z } from 'zod';

/**
 * Milestone 1 draft persistence: localStorage. Milestone 2 replaces this module with Supabase-backed
 * drafts using revision numbers; the async signatures are already shaped for that.
 */
const KEY = 'siteos:draft:v1';

const siteDraftSchema = z.object({
  siteName: z.string(),
  theme: themeTokensSchema,
  pages: z.array(pageDocumentSchema),
  updatedAt: z.string(),
});
export type SiteDraft = z.infer<typeof siteDraftSchema>;

function seed(): SiteDraft {
  return {
    siteName: 'Kopi Sudut',
    theme: demoTheme,
    pages: [demoHomePage, demoAboutPage],
    updatedAt: new Date().toISOString(),
  };
}

function read(): SiteDraft {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed();
    const parsed = siteDraftSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : seed();
  } catch {
    return seed();
  }
}

function write(draft: SiteDraft) {
  localStorage.setItem(KEY, JSON.stringify({ ...draft, updatedAt: new Date().toISOString() }));
}

export async function loadSiteDraft(): Promise<SiteDraft> {
  return read();
}

export function pageSummaries(draft: SiteDraft): PageSummary[] {
  return draft.pages.map((p) => ({ id: p.id, slug: p.slug, title: p.title }));
}

export async function savePageDraft(page: PageDocument): Promise<void> {
  const draft = read();
  const exists = draft.pages.some((p) => p.id === page.id);
  write({
    ...draft,
    pages: exists ? draft.pages.map((p) => (p.id === page.id ? page : p)) : [...draft.pages, page],
  });
}

export async function saveThemeDraft(theme: ThemeTokens): Promise<void> {
  write({ ...read(), theme });
}

export async function createPageDraft(title: string, slug: string): Promise<PageDocument> {
  const page = pageDocumentSchema.parse({
    id: `page_${crypto.randomUUID().slice(0, 8)}`,
    slug,
    title,
    sections: [],
  });
  const draft = read();
  if (draft.pages.some((p) => p.slug === slug))
    throw new Error(`A page with the address ${slug} already exists.`);
  write({ ...draft, pages: [...draft.pages, page] });
  return page;
}

export function resetDemoDraft() {
  localStorage.removeItem(KEY);
}
