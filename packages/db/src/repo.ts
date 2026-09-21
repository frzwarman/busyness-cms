import {
  type PageDocument,
  type PageSummary,
  pageDocumentSchema,
  type ThemeTokens,
  themeTokensSchema,
} from '@siteos/schemas';
import type { Db } from './client.ts';
import type { Json } from './database.types.ts';

/** Zod output types carry optional keys; JSONB columns want plain Json. Same bytes, narrower type. */
const asJson = (v: unknown) => v as Json;

export type MemberRole = 'owner' | 'admin' | 'editor' | 'publisher' | 'viewer';
export type Site = {
  id: string;
  name: string;
  slug: string;
  businessType: string;
  theme: ThemeTokens;
  role: MemberRole;
};
export type Draft = { document: PageDocument; revision: number; updatedAt: string };

/** Thrown by saveDraft when the stored revision moved on. `currentRevision` lets the UI offer a reload. */
export class DraftConflictError extends Error {
  constructor(public readonly currentRevision: number) {
    super('This page was changed elsewhere. Reload to get the latest version before saving again.');
    this.name = 'DraftConflictError';
  }
}

function unwrap<T>(res: { data: T | null; error: { message: string } | null }, what: string): T {
  if (res.error) throw new Error(`${what}: ${res.error.message}`);
  if (res.data === null) throw new Error(`${what}: no data`);
  return res.data;
}

export async function listSites(db: Db): Promise<Site[]> {
  const rows = unwrap(
    await db
      .from('sites')
      .select('id, name, slug, business_type, theme, site_members!inner(role, user_id)')
      .order('created_at'),
    'Loading sites',
  );
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    businessType: r.business_type,
    theme: themeTokensSchema.parse(r.theme),
    role: (r.site_members[0]?.role ?? 'viewer') as MemberRole,
  }));
}

export async function getSite(db: Db, siteId: string): Promise<Site | null> {
  const sites = await listSites(db);
  return sites.find((s) => s.id === siteId) ?? null;
}

export async function createSite(
  db: Db,
  input: { name: string; slug: string; theme: ThemeTokens; businessType?: string },
): Promise<string> {
  return unwrap(
    await db.rpc('create_site', {
      p_name: input.name,
      p_slug: input.slug,
      p_theme: asJson(input.theme),
      p_business_type: input.businessType ?? 'generic',
    }),
    'Creating site',
  );
}

export async function updateTheme(db: Db, siteId: string, theme: ThemeTokens): Promise<void> {
  const { error } = await db.rpc('update_site_theme', { p_site: siteId, p_theme: asJson(theme) });
  if (error) throw new Error(`Saving brand settings: ${error.message}`);
}

export async function listPages(db: Db, siteId: string): Promise<PageSummary[]> {
  const rows = unwrap(
    await db
      .from('pages')
      .select('id, slug, title')
      .eq('site_id', siteId)
      .order('sort_order')
      .order('created_at'),
    'Loading pages',
  );
  return rows.map((r) => ({ id: r.id, slug: r.slug, title: r.title }));
}

export async function getDraft(db: Db, pageId: string): Promise<Draft | null> {
  const { data, error } = await db
    .from('page_drafts')
    .select('document, revision, updated_at')
    .eq('page_id', pageId)
    .maybeSingle();
  if (error) throw new Error(`Loading draft: ${error.message}`);
  if (!data) return null;
  return {
    document: pageDocumentSchema.parse(data.document),
    revision: data.revision,
    updatedAt: data.updated_at,
  };
}

/** Returns the new revision. Throws DraftConflictError on a stale expectedRevision. */
export async function saveDraft(
  db: Db,
  pageId: string,
  expectedRevision: number,
  document: PageDocument,
): Promise<number> {
  const { data, error } = await db.rpc('save_page_draft', {
    p_page: pageId,
    p_expected_revision: expectedRevision,
    p_document: asJson(document),
  });
  if (error) {
    if (error.message.includes('revision_conflict'))
      throw new DraftConflictError(Number(error.details) || expectedRevision + 1);
    throw new Error(`Saving draft: ${error.message}`);
  }
  return data;
}

export async function createPage(db: Db, siteId: string, document: PageDocument): Promise<string> {
  return unwrap(
    await db.rpc('create_page', {
      p_site: siteId,
      p_slug: document.slug,
      p_title: document.title,
      p_document: asJson(document),
    }),
    'Creating page',
  );
}

export async function deletePage(db: Db, pageId: string): Promise<void> {
  const { error } = await db.rpc('delete_page', { p_page: pageId });
  if (error) throw new Error(`Deleting page: ${error.message}`);
}

/** URL-safe site slug from a business name, with a short random suffix to avoid collisions. */
export function slugForSite(name: string): string {
  const base =
    name
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'site';
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}
