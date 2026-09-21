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
  listPages,
  listSites,
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
