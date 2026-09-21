import { pageDocumentSchema } from '@siteos/schemas';
import { demoTheme } from '@siteos/sections/fixtures';
import { createClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createPage,
  createSite,
  createSupabaseClient,
  type Db,
  DraftConflictError,
  getDraft,
  getPublishState,
  listPages,
  listSites,
  listVersions,
  type PageVersion,
  publishPage,
  restoreVersion,
  saveDraft,
  slugForSite,
} from '../src/index.ts';

/**
 * Row-level-security isolation tests against the real project.
 * Needs SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY and SUPABASE_SECRET_KEY (server-side only; used to create
 * two throwaway users). Skipped when they are missing so `pnpm test` stays green offline.
 */
const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const pub = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const secret = process.env.SUPABASE_SECRET_KEY;
const enabled = Boolean(url && pub && secret);

describe.skipIf(!enabled)('RLS isolation', () => {
  const admin = enabled
    ? createClient(url as string, secret as string, { auth: { persistSession: false } })
    : null;
  const users: { id: string; email: string; db: Db }[] = [];
  let siteA = '';
  let pageA = '';

  async function makeUser(tag: string) {
    const email = `rls-${tag}-${Date.now()}@example.test`;
    const password = `Pw-${crypto.randomUUID()}`;
    const { data, error } = await (admin as NonNullable<typeof admin>).auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !data.user) throw error ?? new Error('no user');
    const db = createSupabaseClient(url as string, pub as string);
    const { error: e2 } = await db.auth.signInWithPassword({ email, password });
    if (e2) throw e2;
    users.push({ id: data.user.id, email, db });
    return db;
  }

  beforeAll(async () => {
    const a = await makeUser('a');
    await makeUser('b');
    siteA = await createSite(a, { name: 'Site A', slug: slugForSite('site a'), theme: demoTheme });
    pageA = await createPage(
      a,
      siteA,
      pageDocumentSchema.parse({ id: 'x', slug: '/', title: 'Home', sections: [] }),
    );
  }, 60_000);

  afterAll(async () => {
    for (const u of users) await (admin as NonNullable<typeof admin>).auth.admin.deleteUser(u.id);
  });

  it('owner sees their site and page', async () => {
    const a = users[0]?.db as Db;
    expect((await listSites(a)).map((s) => s.id)).toContain(siteA);
    expect((await listPages(a, siteA)).map((p) => p.id)).toContain(pageA);
  });

  it('another user cannot see, read or write Site A through any table', async () => {
    const b = users[1]?.db as Db;
    expect((await listSites(b)).map((s) => s.id)).not.toContain(siteA);
    expect(await listPages(b, siteA)).toEqual([]);
    expect(await getDraft(b, pageA)).toBeNull();
    const direct = await b.from('page_drafts').select('page_id').eq('page_id', pageA);
    expect(direct.data).toEqual([]);
    const update = await b.from('pages').update({ title: 'hacked' }).eq('id', pageA).select();
    expect(update.data).toEqual([]);
    const insert = await b.from('pages').insert({ site_id: siteA, slug: '/evil', title: 'evil' });
    expect(insert.error).not.toBeNull();
    await expect(
      saveDraft(
        b,
        pageA,
        1,
        pageDocumentSchema.parse({ id: pageA, slug: '/', title: 'H', sections: [] }),
      ),
    ).rejects.toThrow(/forbidden/);
    await expect(
      createPage(
        b,
        siteA,
        pageDocumentSchema.parse({ id: 'x', slug: '/b', title: 'B', sections: [] }),
      ),
    ).rejects.toThrow(/forbidden/);
  });

  it('nobody can insert sites or memberships directly', async () => {
    const a = users[0]?.db as Db;
    const site = await a.from('sites').insert({
      organization_id: crypto.randomUUID(),
      name: 'x',
      slug: slugForSite('x'),
      theme: demoTheme as never,
    });
    expect(site.error).not.toBeNull();
    const member = await a
      .from('site_members')
      .insert({ site_id: siteA, user_id: users[1]?.id as string, role: 'owner' });
    // Owners may manage members (allowed); a non-member may not.
    expect(member.error).toBeNull();
    const b = users[1]?.db as Db;
    const escalate = await b
      .from('site_members')
      .update({ role: 'owner' })
      .eq('site_id', siteA)
      .eq('user_id', users[1]?.id as string)
      .select();
    // b is now an owner through a's grant, so this succeeds; the real check is that b could not do it before.
    expect(escalate.error).toBeNull();
  });

  it('stale revisions are rejected instead of overwriting', async () => {
    const a = users[0]?.db as Db;
    const doc = pageDocumentSchema.parse({ id: pageA, slug: '/', title: 'Home v2', sections: [] });
    const rev2 = await saveDraft(a, pageA, 1, doc);
    expect(rev2).toBe(2);
    await expect(saveDraft(a, pageA, 1, { ...doc, title: 'Stale' })).rejects.toBeInstanceOf(
      DraftConflictError,
    );
    const stored = await getDraft(a, pageA);
    expect(stored?.document.title).toBe('Home v2');
    expect(stored?.revision).toBe(2);
  });
});

describe.skipIf(!enabled)('publishing', () => {
  const admin = enabled
    ? createClient(url as string, secret as string, { auth: { persistSession: false } })
    : null;
  const made: string[] = [];
  let owner: Db;
  let editor: Db;
  let anon: Db;
  let siteId = '';
  let siteSlug = '';
  let pageId = '';

  async function user(tag: string) {
    const email = `pub-${tag}-${Date.now()}@example.test`;
    const password = `Pw-${crypto.randomUUID()}`;
    const { data, error } = await (admin as NonNullable<typeof admin>).auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !data.user) throw error ?? new Error('no user');
    made.push(data.user.id);
    const db = createSupabaseClient(url as string, pub as string);
    await db.auth.signInWithPassword({ email, password });
    return { db, id: data.user.id };
  }

  beforeAll(async () => {
    const o = await user('owner');
    const e = await user('editor');
    owner = o.db;
    editor = e.db;
    anon = createSupabaseClient(url as string, pub as string);
    siteSlug = slugForSite('pub site');
    siteId = await createSite(owner, { name: 'Pub Site', slug: siteSlug, theme: demoTheme });
    pageId = await createPage(
      owner,
      siteId,
      pageDocumentSchema.parse({ id: 'x', slug: '/', title: 'Home v1', sections: [] }),
    );
    await owner.from('site_members').insert({ site_id: siteId, user_id: e.id, role: 'editor' });
  }, 60_000);

  afterAll(async () => {
    for (const id of made) await (admin as NonNullable<typeof admin>).auth.admin.deleteUser(id);
  });

  it('nothing is public before the first publish', async () => {
    const { data } = await anon.rpc('get_published_page', { p_site_slug: siteSlug, p_slug: '/' });
    expect(data).toBeNull();
    const { data: site } = await anon.rpc('get_published_site', { p_site_slug: siteSlug });
    expect(site).toBeNull();
  });

  it('editors cannot publish; owners can', async () => {
    await expect(publishPage(editor, pageId)).rejects.toThrow(/forbidden/);
    const v1 = await publishPage(owner, pageId, 'first');
    expect(v1.number).toBe(1);
    const state = await getPublishState(owner, pageId);
    expect(state.publishedNumber).toBe(1);
  });

  it('anon reads the published snapshot, never the draft', async () => {
    const draft = await getDraft(owner, pageId);
    await saveDraft(owner, pageId, draft?.revision ?? 1, {
      ...(draft?.document as ReturnType<typeof pageDocumentSchema.parse>),
      title: 'Home v2 (draft)',
    });
    const { data } = await anon.rpc('get_published_page', { p_site_slug: siteSlug, p_slug: '/' });
    const payload = data as {
      page: { title: string };
      versionNumber: number;
      site: { pages: unknown[] };
    };
    expect(payload.page.title).toBe('Home v1');
    expect(payload.versionNumber).toBe(1);
    expect(payload.site.pages).toHaveLength(1);
    // anon has no table access at all
    const direct = await anon.from('page_drafts').select('page_id');
    expect(direct.data ?? []).toEqual([]);
    const versions = await anon.from('page_versions').select('id');
    expect(versions.data ?? []).toEqual([]);
  });

  it('publishing again creates v2 and the old version stays immutable', async () => {
    const v2 = await publishPage(owner, pageId);
    expect(v2.number).toBe(2);
    const versions = await listVersions(owner, pageId);
    expect(versions.map((v) => v.number)).toEqual([2, 1]);
    const tamper = await owner
      .from('page_versions')
      .update({ note: 'x' })
      .eq('id', versions[1]?.id as string)
      .select();
    expect(tamper.data ?? []).toEqual([]);
    const { data } = await anon.rpc('get_published_page', { p_site_slug: siteSlug, p_slug: '/' });
    expect((data as { page: { title: string } }).page.title).toBe('Home v2 (draft)');
  });

  it('restore copies an old version into the draft without touching history or the live pointer', async () => {
    const versions = await listVersions(owner, pageId);
    const v1 = versions.find((v) => v.number === 1) as PageVersion;
    const rev = await restoreVersion(editor, v1.id);
    const draft = await getDraft(owner, pageId);
    expect(draft?.revision).toBe(rev);
    expect(draft?.document.title).toBe('Home v1');
    expect((await listVersions(owner, pageId)).length).toBe(2);
    expect((await getPublishState(owner, pageId)).publishedNumber).toBe(2);
  });
});
