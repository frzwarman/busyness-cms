import {
  type FormDefinition,
  formDefinitionSchema,
  type PageDocument,
  type PageSummary,
  pageDocumentSchema,
  type SiteSettings,
  siteSettingsSchema,
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
  settings: SiteSettings;
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
      .select('id, name, slug, business_type, theme, settings, site_members!inner(role, user_id)')
      .order('created_at'),
    'Loading sites',
  );
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    businessType: r.business_type,
    theme: themeTokensSchema.parse(r.theme),
    settings: siteSettingsSchema.parse(r.settings ?? {}),
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
  /** Draft with content/globals inlined (see @siteos/sections resolveDocument); stored as the version. */
  resolvedDocument?: PageDocument,
): Promise<{ versionId: string; number: number }> {
  const rows = unwrap(
    await db.rpc('publish_page', {
      p_page: pageId,
      p_note: note ?? undefined,
      p_document: resolvedDocument ? asJson(resolvedDocument) : undefined,
    }),
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

// ---------------------------------------------------------------------------
// Content library + globals (Milestone 6)
// ---------------------------------------------------------------------------
export type ContentEntryRow = {
  id: string;
  collection: string;
  data: Record<string, unknown>;
  tags: string[];
  sortOrder: number;
  updatedAt: string;
};
export type GlobalRow = {
  id: string;
  name: string;
  section: { type: string; schemaVersion: number; props: Record<string, unknown> };
  revision: number;
  updatedAt: string;
};
export type Ref = { pageId: string; pageTitle: string; sectionId: string };

export async function listEntries(db: Db, siteId: string): Promise<ContentEntryRow[]> {
  const rows = unwrap(
    await db
      .from('content_entries')
      .select('id, collection, data, tags, sort_order, updated_at')
      .eq('site_id', siteId)
      .order('sort_order')
      .order('created_at'),
    'Loading content',
  );
  return rows.map((r) => ({
    id: r.id,
    collection: r.collection,
    data: r.data as Record<string, unknown>,
    tags: r.tags,
    sortOrder: r.sort_order,
    updatedAt: r.updated_at,
  }));
}

export async function createEntry(
  db: Db,
  siteId: string,
  collection: string,
  data: Record<string, unknown>,
  tags: string[] = [],
): Promise<string> {
  const res = await db
    .from('content_entries')
    .insert({ site_id: siteId, collection, data: asJson(data), tags })
    .select('id')
    .single();
  if (res.error) throw new Error(`Creating ${collection} entry: ${res.error.message}`);
  return res.data.id;
}

export async function updateEntry(
  db: Db,
  id: string,
  patch: { data?: Record<string, unknown>; tags?: string[]; sortOrder?: number },
): Promise<void> {
  const { error } = await db
    .from('content_entries')
    .update({
      ...(patch.data ? { data: asJson(patch.data) } : {}),
      ...(patch.tags ? { tags: patch.tags } : {}),
      ...(patch.sortOrder !== undefined ? { sort_order: patch.sortOrder } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw new Error(`Saving entry: ${error.message}`);
}

export async function deleteEntry(db: Db, id: string): Promise<void> {
  const { error } = await db.from('content_entries').delete().eq('id', id);
  if (error) throw new Error(`Deleting entry: ${error.message}`);
}

export async function entryRefs(db: Db, id: string): Promise<Ref[]> {
  const rows = unwrap(
    await db.rpc('content_entry_refs', { p_entry: id }),
    'Checking where this entry is used',
  );
  return rows.map((r) => ({ pageId: r.page_id, pageTitle: r.page_title, sectionId: r.section_id }));
}

export async function listGlobals(db: Db, siteId: string): Promise<GlobalRow[]> {
  const rows = unwrap(
    await db
      .from('globals')
      .select('id, name, section, revision, updated_at')
      .eq('site_id', siteId)
      .order('created_at'),
    'Loading global sections',
  );
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    section: r.section as GlobalRow['section'],
    revision: r.revision,
    updatedAt: r.updated_at,
  }));
}

export async function createGlobal(
  db: Db,
  siteId: string,
  name: string,
  section: GlobalRow['section'],
): Promise<GlobalRow> {
  const res = await db
    .from('globals')
    .insert({ site_id: siteId, name, section: asJson(section) })
    .select('id, name, section, revision, updated_at')
    .single();
  if (res.error) throw new Error(`Creating global section: ${res.error.message}`);
  return {
    id: res.data.id,
    name: res.data.name,
    section: res.data.section as GlobalRow['section'],
    revision: res.data.revision,
    updatedAt: res.data.updated_at,
  };
}

/** Returns the new revision; throws DraftConflictError when someone else saved first. */
export async function saveGlobal(
  db: Db,
  id: string,
  expectedRevision: number,
  section: GlobalRow['section'],
  name?: string,
): Promise<number> {
  const { data, error } = await db.rpc('save_global', {
    p_id: id,
    p_expected_revision: expectedRevision,
    p_section: asJson(section),
    p_name: name ?? undefined,
  });
  if (error) {
    if (error.message.includes('revision_conflict'))
      throw new DraftConflictError(Number(error.details) || expectedRevision + 1);
    throw new Error(`Saving global section: ${error.message}`);
  }
  return data;
}

export async function deleteGlobal(db: Db, id: string): Promise<void> {
  const { error } = await db.from('globals').delete().eq('id', id);
  if (error) throw new Error(`Deleting global section: ${error.message}`);
}

export async function globalRefs(db: Db, id: string): Promise<Ref[]> {
  const rows = unwrap(
    await db.rpc('global_refs', { p_global: id }),
    'Checking where this global is used',
  );
  return rows.map((r) => ({ pageId: r.page_id, pageTitle: r.page_title, sectionId: r.section_id }));
}

// ---------------------------------------------------------------------------
// Site settings, redirects, forms (Milestone 7)
// ---------------------------------------------------------------------------
export async function updateSiteSettings(
  db: Db,
  siteId: string,
  settings: SiteSettings,
): Promise<void> {
  const { error } = await db.rpc('update_site_settings', {
    p_site: siteId,
    p_settings: asJson(settings),
  });
  if (error) throw new Error(`Saving site settings: ${error.message}`);
}

export type Redirect = { id: string; fromPath: string; toPath: string; createdAt: string };
export async function listRedirects(db: Db, siteId: string): Promise<Redirect[]> {
  const rows = unwrap(
    await db
      .from('redirects')
      .select('id, from_path, to_path, created_at')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false }),
    'Loading redirects',
  );
  return rows.map((r) => ({
    id: r.id,
    fromPath: r.from_path,
    toPath: r.to_path,
    createdAt: r.created_at,
  }));
}
export async function createRedirect(
  db: Db,
  siteId: string,
  fromPath: string,
  toPath: string,
): Promise<void> {
  const { error } = await db
    .from('redirects')
    .insert({ site_id: siteId, from_path: fromPath, to_path: toPath });
  if (error)
    throw new Error(
      error.code === '23505'
        ? `A redirect from ${fromPath} already exists.`
        : `Creating redirect: ${error.message}`,
    );
}
export async function deleteRedirect(db: Db, id: string): Promise<void> {
  const { error } = await db.from('redirects').delete().eq('id', id);
  if (error) throw new Error(`Deleting redirect: ${error.message}`);
}

export type FormRow = FormDefinition & { updatedAt: string };
export async function listForms(db: Db, siteId: string): Promise<FormRow[]> {
  const rows = unwrap(
    await db
      .from('forms')
      .select('id, name, fields, settings, updated_at')
      .eq('site_id', siteId)
      .order('created_at'),
    'Loading forms',
  );
  return rows.map((r) => ({
    ...formDefinitionSchema.parse({
      id: r.id,
      name: r.name,
      fields: r.fields,
      settings: r.settings,
    }),
    updatedAt: r.updated_at,
  }));
}
export async function createForm(
  db: Db,
  siteId: string,
  form: Omit<FormDefinition, 'id'>,
): Promise<string> {
  const res = await db
    .from('forms')
    .insert({
      site_id: siteId,
      name: form.name,
      fields: asJson(form.fields),
      settings: asJson(form.settings),
    })
    .select('id')
    .single();
  if (res.error) throw new Error(`Creating form: ${res.error.message}`);
  return res.data.id;
}
export async function updateForm(db: Db, form: FormDefinition): Promise<void> {
  const { error } = await db
    .from('forms')
    .update({
      name: form.name,
      fields: asJson(form.fields),
      settings: asJson(form.settings),
      updated_at: new Date().toISOString(),
    })
    .eq('id', form.id);
  if (error) throw new Error(`Saving form: ${error.message}`);
}
export async function deleteForm(db: Db, id: string): Promise<void> {
  const { error } = await db.from('forms').delete().eq('id', id);
  if (error) throw new Error(`Deleting form: ${error.message}`);
}

export type Submission = {
  id: string;
  formId: string;
  data: Record<string, unknown>;
  meta: { page?: string; referer?: string; userAgent?: string };
  status: 'new' | 'read';
  createdAt: string;
};
export async function listSubmissions(
  db: Db,
  siteId: string,
  opts: { formId?: string; since?: string; limit?: number } = {},
): Promise<Submission[]> {
  let q = db
    .from('form_submissions')
    .select('id, form_id, data, meta, status, created_at')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false })
    .limit(opts.limit ?? 200);
  if (opts.formId) q = q.eq('form_id', opts.formId);
  if (opts.since) q = q.gte('created_at', opts.since);
  const rows = unwrap(await q, 'Loading submissions');
  return rows.map((r) => ({
    id: r.id,
    formId: r.form_id,
    data: r.data as Record<string, unknown>,
    meta: (r.meta ?? {}) as Submission['meta'],
    status: r.status as Submission['status'],
    createdAt: r.created_at,
  }));
}
export async function setSubmissionStatus(
  db: Db,
  id: string,
  status: Submission['status'],
): Promise<void> {
  const { error } = await db.from('form_submissions').update({ status }).eq('id', id);
  if (error) throw new Error(`Updating submission: ${error.message}`);
}
export async function deleteSubmission(db: Db, id: string): Promise<void> {
  const { error } = await db.from('form_submissions').delete().eq('id', id);
  if (error) throw new Error(`Deleting submission: ${error.message}`);
}

/** CSV with one column per form field, in field order, plus received time and page. Values are quoted safely. */
export function submissionsToCsv(form: FormDefinition, rows: Submission[]): string {
  const esc = (v: unknown) => {
    const s =
      v === undefined || v === null ? '' : typeof v === 'boolean' ? (v ? 'yes' : 'no') : String(v);
    return /[",\n\r]/.test(s) || /^[=+\-@]/.test(s)
      ? `"${s.replace(/"/g, '""').replace(/^([=+\-@])/, "'$1")}"`
      : s;
  };
  const header = ['Received', 'Page', ...form.fields.map((f) => f.label)];
  const lines = rows.map((r) =>
    [r.createdAt, r.meta.page ?? '', ...form.fields.map((f) => r.data[f.id])].map(esc).join(','),
  );
  return [header.map(esc).join(','), ...lines].join('\r\n');
}

/** Owner only. Deletes the site (cascades pages, assets metadata, forms…) and returns R2 keys to remove. */
export async function deleteSite(db: Db, siteId: string): Promise<string[]> {
  const { data, error } = await db.rpc('delete_site', { p_site: siteId });
  if (error) throw new Error(`Deleting site: ${error.message}`);
  return data ?? [];
}

/** Draft pages whose typed links point at this page (for delete warnings). */
export async function pageRefs(db: Db, pageId: string): Promise<Ref[]> {
  const rows = unwrap(await db.rpc('page_refs', { p_page: pageId }), 'Checking links to this page');
  return rows.map((r) => ({ pageId: r.page_id, pageTitle: r.page_title, sectionId: r.section_id }));
}

export type AuditEntry = {
  id: number;
  action: string;
  entityType: string;
  entityId: string | null;
  actor: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};
export async function listAudit(db: Db, siteId: string, limit = 50): Promise<AuditEntry[]> {
  const rows = unwrap(
    await db
      .from('audit_logs')
      .select('id, action, entity_type, entity_id, actor, metadata, created_at')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .limit(limit),
    'Loading activity',
  );
  return rows.map((r) => ({
    id: r.id,
    action: r.action,
    entityType: r.entity_type,
    entityId: r.entity_id,
    actor: r.actor,
    metadata: (r.metadata ?? {}) as Record<string, unknown>,
    createdAt: r.created_at,
  }));
}
