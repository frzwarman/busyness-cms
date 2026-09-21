import type { Env } from './env.ts';

/**
 * The worker never holds a Supabase secret. It forwards the user's own access token with the publishable
 * key, so every query runs under that user's RLS — membership checks included.
 */
export async function getUser(env: Env, token: string): Promise<{ id: string } | null> {
  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: env.SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const u = (await res.json()) as { id?: string };
  return u.id ? { id: u.id } : null;
}

export async function rest<T>(
  env: Env,
  token: string,
  path: string,
  init: RequestInit = {},
): Promise<{ ok: true; data: T } | { ok: false; status: number; message: string }> {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: env.SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      message?: string;
      details?: string;
      hint?: string;
    };
    return {
      ok: false,
      status: res.status,
      message: body.message ?? res.statusText,
      ...(body.details ? { details: body.details } : {}),
    } as { ok: false; status: number; message: string };
  }
  return { ok: true, data: (await res.json()) as T };
}

/** The caller's role on a site, or null when not a member (RLS hides everything else). */
export async function siteRole(
  env: Env,
  token: string,
  siteId: string,
  userId: string,
): Promise<string | null> {
  const r = await rest<Array<{ role: string }>>(
    env,
    token,
    `site_members?select=role&site_id=eq.${siteId}&user_id=eq.${userId}`,
  );
  return r.ok ? (r.data[0]?.role ?? null) : null;
}
