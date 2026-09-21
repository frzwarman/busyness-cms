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

// ---------------------------------------------------------------------------
// Publishing (Milestone 3)
// ---------------------------------------------------------------------------
export type PageVersion = {
  id: string;
  number: number;
  document: PageDocument;
  note: string | null;
  source: 'publish' | 'restore';
  createdAt: string;
  createdBy: string | null;
};

export type PublishState = {
  publishedVersionId: string | null;
  publishedAt: string | null;
  publishedNumber: number | null;
  publishedDocument: PageDocument | null;
};

/** Publisher role or above. Returns the new version. */
export async function publishPage(
  db: Db,
  pageId: string,
  note?: string,
): Promise<{ versionId: string; number: number }> {
  const rows = unwrap(
    await db.rpc('publish_page', { p_page: pageId, p_note: note ?? undefined }),
    'Publishing',
  );
  const row = rows[0];
  if (!row) throw new Error('Publishing: no version returned');
  return { versionId: row.version_id, number: row.number };
}

export async function unpublishPage(db: Db, pageId: string): Promise<void> {
  const { error } = await db.rpc('unpublish_page', { p_page: pageId });
  if (error) throw new Error(`Unpublishing: ${error.message}`);
}

/** Copies a version into the draft as a new revision and returns that revision. */
export async function restoreVersion(db: Db, versionId: string): Promise<number> {
  return unwrap(await db.rpc('restore_version', { p_version: versionId }), 'Restoring version');
}

export async function listVersions(db: Db, pageId: string): Promise<PageVersion[]> {
  const rows = unwrap(
    await db
      .from('page_versions')
      .select('id, number, document, note, source, created_at, created_by')
      .eq('page_id', pageId)
      .order('number', { ascending: false }),
    'Loading versions',
  );
  return rows.map((r) => ({
    id: r.id,
    number: r.number,
    document: pageDocumentSchema.parse(r.document),
    note: r.note,
    source: r.source as PageVersion['source'],
    createdAt: r.created_at,
    createdBy: r.created_by,
  }));
}

export async function getPublishState(db: Db, pageId: string): Promise<PublishState> {
  // Single-row responses are unions PostgREST types as {data|null, error|null}; destructure instead of unwrap().
  const pageRes = await db
    .from('pages')
    .select('published_version_id, published_at')
    .eq('id', pageId)
    .maybeSingle();
  if (pageRes.error) throw new Error(`Loading publish state: ${pageRes.error.message}`);
  const page = pageRes.data;
  if (!page) throw new Error('Loading publish state: page not found');
  if (!page.published_version_id)
    return {
      publishedVersionId: null,
      publishedAt: null,
      publishedNumber: null,
      publishedDocument: null,
    };
  const versionRes = await db
    .from('page_versions')
    .select('number, document')
    .eq('id', page.published_version_id)
    .single();
  if (versionRes.error) throw new Error(`Loading published version: ${versionRes.error.message}`);
  const version = versionRes.data;
  return {
    publishedVersionId: page.published_version_id,
    publishedAt: page.published_at,
    publishedNumber: version.number,
    publishedDocument: pageDocumentSchema.parse(version.document),
  };
}

// ---------------------------------------------------------------------------
// Assets (Milestone 5)
// ---------------------------------------------------------------------------
export type AssetVariant = {
  name: 'original' | '1920' | '960' | '320';
  key: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  size: number;
};
export type Asset = {
  id: string;
  siteId: string;
  filename: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  sha256: string;
  alt: string;
  decorative: boolean;
  caption: string;
  tags: string[];
  focalX: number;
  focalY: number;
  createdAt: string;
  variants: AssetVariant[];
};
export type AssetUsage = {
  pageId: string;
  pageTitle: string;
  pageSlug: string;
  sectionId: string;
  kind: 'draft' | 'published';
};

export class AssetInUseError extends Error {
  constructor(public readonly usages: number) {
    super(
      `This asset is used in ${usages} place${usages === 1 ? '' : 's'} and cannot be deleted yet.`,
    );
    this.name = 'AssetInUseError';
  }
}

export async function listAssets(db: Db, siteId: string): Promise<Asset[]> {
  const rows = unwrap(
    await db
      .from('assets')
      .select(
        'id, site_id, filename, mime_type, size, width, height, sha256, alt, decorative, caption, tags, focal_x, focal_y, created_at, asset_variants(name, key, mime_type, width, height, size)',
      )
      .eq('site_id', siteId)
      .order('created_at', { ascending: false }),
    'Loading assets',
  );
  return rows.map((r) => ({
    id: r.id,
    siteId: r.site_id,
    filename: r.filename,
    mimeType: r.mime_type,
    size: r.size,
    width: r.width,
    height: r.height,
    sha256: r.sha256,
    alt: r.alt,
    decorative: r.decorative,
    caption: r.caption,
    tags: r.tags,
    focalX: r.focal_x,
    focalY: r.focal_y,
    createdAt: r.created_at,
    variants: r.asset_variants.map((v) => ({
      name: v.name as AssetVariant['name'],
      key: v.key,
      mimeType: v.mime_type,
      width: v.width,
      height: v.height,
      size: v.size,
    })),
  }));
}

export async function listAssetUsages(db: Db, assetId: string): Promise<AssetUsage[]> {
  const rows = unwrap(
    await db
      .from('asset_usages')
      .select('page_id, section_id, kind, pages(title, slug)')
      .eq('asset_id', assetId),
    'Loading asset usage',
  );
  return rows.map((r) => {
    const page = Array.isArray(r.pages) ? r.pages[0] : r.pages;
    return {
      pageId: r.page_id,
      sectionId: r.section_id,
      kind: r.kind as AssetUsage['kind'],
      pageTitle: page?.title ?? 'Unknown page',
      pageSlug: page?.slug ?? '',
    };
  });
}

/** Usage counts for many assets at once (for the browser's "Used in N places" badges). */
export async function countAssetUsages(db: Db, siteId: string): Promise<Record<string, number>> {
  const rows = unwrap(
    await db.from('asset_usages').select('asset_id, page_id, section_id').eq('site_id', siteId),
    'Loading asset usage',
  );
  const seen = new Set<string>();
  const counts: Record<string, number> = {};
  for (const r of rows) {
    const k = `${r.asset_id}:${r.page_id}:${r.section_id}`;
    if (seen.has(k)) continue;
    seen.add(k);
    counts[r.asset_id] = (counts[r.asset_id] ?? 0) + 1;
  }
  return counts;
}

export async function updateAsset(
  db: Db,
  asset: Pick<Asset, 'id' | 'alt' | 'decorative' | 'caption' | 'tags' | 'focalX' | 'focalY'>,
): Promise<void> {
  const { error } = await db.rpc('update_asset', {
    p_id: asset.id,
    p_alt: asset.alt,
    p_decorative: asset.decorative,
    p_caption: asset.caption,
    p_tags: asset.tags,
    p_focal_x: asset.focalX,
    p_focal_y: asset.focalY,
  });
  if (error) throw new Error(`Saving asset details: ${error.message}`);
}

/** Deletes the metadata row (refused while in use unless forced by an admin) and returns the R2 keys to remove. */
export async function deleteAsset(db: Db, assetId: string, force = false): Promise<string[]> {
  const { data, error } = await db.rpc('delete_asset', { p_id: assetId, p_force: force });
  if (error) {
    if (error.message.includes('asset_in_use'))
      throw new AssetInUseError(Number(error.details) || 1);
    throw new Error(`Deleting asset: ${error.message}`);
  }
  return data ?? [];
}
