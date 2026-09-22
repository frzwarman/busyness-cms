import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import type { Env } from './env.ts';
import { getUser, rest, siteRole } from './supabase.ts';
import { signTicket, verifyTicket } from './ticket.ts';

/**
 * SiteOS edge worker: secure upload flow for assets (no R2 credentials ever reach a browser) and
 * optional serving of asset bytes. Authorization = the user's Supabase token + their site role, checked here
 * and again inside the SQL functions that register metadata.
 */
const app = new Hono<{ Bindings: Env; Variables: { token: string; userId: string } }>();

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]);
const VARIANT_NAMES = ['original', '1920', '960', '320'] as const;
const MAX_BYTES = 25 * 1024 * 1024;
const TICKET_TTL_MS = 15 * 60 * 1000;
const uuid = z.uuid();

app.use('*', async (c, next) => {
  const origin = c.env.STUDIO_ORIGIN;
  return cors({
    origin: (o) => (o === origin ? o : ''),
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Authorization', 'Content-Type', 'X-Upload-Ticket'],
    maxAge: 600,
  })(c, next);
});

/** Public read of asset bytes when no PUBLIC_ASSET_BASE_URL (e.g. R2 public domain) is configured. */
app.get('/assets/*', async (c) => {
  const key = c.req.path.replace(/^\/assets\//, '');
  if (
    !/^sites\/[0-9a-f-]{36}\/assets\/[0-9a-f-]{36}\/(original|1920|960|320)\.[a-z0-9]{2,4}$/.test(
      key,
    )
  )
    return c.notFound();
  const obj = await c.env.ASSETS.get(key);
  if (!obj) return c.notFound();
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('ETag', obj.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('X-Content-Type-Options', 'nosniff');
  // Lets the Studio preview measure asset transfer sizes via Resource Timing.
  headers.set('Timing-Allow-Origin', '*');
  if (c.req.header('If-None-Match') === obj.httpEtag)
    return new Response(null, { status: 304, headers });
  return new Response(obj.body, { headers });
});

// Everything below needs a signed-in user.
app.use('/uploads/*', async (c, next) => {
  const auth = c.req.header('Authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return c.json({ error: 'Sign in required' }, 401);
  const user = await getUser(c.env, token);
  if (!user) return c.json({ error: 'Session expired. Sign in again.' }, 401);
  c.set('token', token);
  c.set('userId', user.id);
  await next();
});

const authorizeBody = z.object({
  siteId: uuid,
  filename: z.string().min(1).max(255),
  mimeType: z.string(),
  size: z.number().int().positive().max(MAX_BYTES),
  sha256: z.string().regex(/^[0-9a-f]{64}$/),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  variants: z
    .array(
      z.object({
        name: z.enum(VARIANT_NAMES),
        mimeType: z.string(),
        size: z.number().int().positive().max(MAX_BYTES),
        width: z.number().int().positive().nullable(),
        height: z.number().int().positive().nullable(),
      }),
    )
    .min(1)
    .max(4),
});

/** Step 1: duplicate check + ticket. Returns either the existing asset or where to PUT each variant. */
app.post('/uploads/authorize', async (c) => {
  const parsed = authorizeBody.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success)
    return c.json(
      {
        error: 'Invalid upload request',
        issues: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      },
      400,
    );
  const body = parsed.data;
  if (!ALLOWED_MIME.has(body.mimeType))
    return c.json(
      { error: `Files of type ${body.mimeType} are not allowed. Use JPEG, PNG, WebP, GIF or PDF.` },
      415,
    );
  for (const v of body.variants)
    if (!ALLOWED_MIME.has(v.mimeType))
      return c.json({ error: `Variant type ${v.mimeType} is not allowed.` }, 415);

  const role = await siteRole(c.env, c.get('token'), body.siteId, c.get('userId'));
  if (!role || role === 'viewer')
    return c.json({ error: 'You do not have permission to upload to this site.' }, 403);

  const dup = await rest<Array<{ id: string; filename: string }>>(
    c.env,
    c.get('token'),
    `assets?select=id,filename&site_id=eq.${body.siteId}&sha256=eq.${body.sha256}`,
  );
  if (dup.ok && dup.data[0]) return c.json({ duplicate: dup.data[0] });

  const assetId = crypto.randomUUID();
  const mimes = Object.fromEntries(body.variants.map((v) => [v.name, v.mimeType]));
  const ticket = await signTicket(
    {
      siteId: body.siteId,
      assetId,
      userId: c.get('userId'),
      variants: body.variants.map((v) => v.name),
      mimes,
      exp: Date.now() + TICKET_TTL_MS,
    },
    c.env.UPLOAD_SIGNING_SECRET,
  );
  return c.json({
    assetId,
    ticket,
    uploads: body.variants.map((v) => ({ name: v.name, url: `/uploads/${assetId}/${v.name}` })),
  });
});

const extFor = (mime: string) =>
  ({
    'image/webp': 'webp',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'application/pdf': 'pdf',
  })[mime] ?? 'bin';
const keyFor = (siteId: string, assetId: string, name: string, mime: string) =>
  `sites/${siteId}/assets/${assetId}/${name}.${extFor(mime)}`;

/** Step 2: stream one variant into R2. The ticket (not the URL) decides the key; content type is sniffed by magic bytes. */
app.put('/uploads/:assetId/:name', async (c) => {
  const ticket = await verifyTicket(
    c.req.header('X-Upload-Ticket') ?? '',
    c.env.UPLOAD_SIGNING_SECRET,
  );
  const name = c.req.param('name');
  if (
    !ticket ||
    ticket.assetId !== c.req.param('assetId') ||
    ticket.userId !== c.get('userId') ||
    !ticket.variants.includes(name)
  )
    return c.json({ error: 'Upload ticket is invalid or expired. Start the upload again.' }, 403);
  const mime = ticket.mimes[name];
  if (!mime) return c.json({ error: 'Unknown variant' }, 400);
  const len = Number(c.req.header('Content-Length') ?? 0);
  if (!len || len > MAX_BYTES) return c.json({ error: 'Missing or oversized body' }, 413);
  const body = await c.req.arrayBuffer();
  if (!sniffMatches(new Uint8Array(body.slice(0, 16)), mime))
    return c.json({ error: 'File contents do not match the declared type.' }, 415);
  const key = keyFor(ticket.siteId, ticket.assetId, name, mime);
  await c.env.ASSETS.put(key, body, {
    httpMetadata: { contentType: mime, cacheControl: 'public, max-age=31536000, immutable' },
  });
  return c.json({ key, size: body.byteLength });
});

/** Step 3: confirm every variant landed, then register metadata under the user's RLS via create_asset(). */
app.post('/uploads/:assetId/complete', async (c) => {
  const ticket = await verifyTicket(
    c.req.header('X-Upload-Ticket') ?? '',
    c.env.UPLOAD_SIGNING_SECRET,
  );
  if (!ticket || ticket.assetId !== c.req.param('assetId') || ticket.userId !== c.get('userId'))
    return c.json({ error: 'Upload ticket is invalid or expired.' }, 403);
  const meta = authorizeBody.safeParse(await c.req.json().catch(() => null));
  if (!meta.success || meta.data.siteId !== ticket.siteId)
    return c.json({ error: 'Invalid completion payload' }, 400);
  const variants: Array<{
    name: string;
    mime: string;
    width: number | null;
    height: number | null;
    size: number;
  }> = [];
  for (const v of meta.data.variants) {
    if (!ticket.variants.includes(v.name))
      return c.json({ error: `Variant ${v.name} was not authorized` }, 400);
    const head = await c.env.ASSETS.head(keyFor(ticket.siteId, ticket.assetId, v.name, v.mimeType));
    if (!head) return c.json({ error: `Variant ${v.name} was not uploaded.` }, 409);
    variants.push({
      name: v.name,
      mime: v.mimeType,
      width: v.width,
      height: v.height,
      size: head.size,
    });
  }
  const r = await rest<string>(c.env, c.get('token'), 'rpc/create_asset', {
    method: 'POST',
    body: JSON.stringify({
      p_id: ticket.assetId,
      p_site: ticket.siteId,
      p_filename: meta.data.filename,
      p_mime: meta.data.mimeType,
      p_size: meta.data.size,
      p_width: meta.data.width,
      p_height: meta.data.height,
      p_sha256: meta.data.sha256,
      p_variants: variants,
    }),
  });
  if (!r.ok) {
    // Roll back the bytes so no orphan objects remain.
    await Promise.all(
      variants.map((v) =>
        c.env.ASSETS.delete(keyFor(ticket.siteId, ticket.assetId, v.name, v.mime)),
      ),
    );
    return c.json(
      {
        error:
          r.status === 409
            ? 'This file already exists in your asset library.'
            : `Could not register asset: ${r.message}`,
      },
      r.status === 409 ? 409 : 500,
    );
  }
  const base = c.env.PUBLIC_ASSET_BASE_URL || `${new URL(c.req.url).origin}/assets`;
  return c.json({
    assetId: ticket.assetId,
    urls: Object.fromEntries(
      variants.map((v) => [
        v.name,
        `${base}/${keyFor(ticket.siteId, ticket.assetId, v.name, v.mime)}`,
      ]),
    ),
  });
});

/** Delete bytes after delete_asset() succeeded in Postgres (the client passes back the keys it returned). */
app.delete('/uploads/objects', async (c) => {
  const parsed = z
    .object({
      siteId: uuid,
      keys: z
        .array(
          z
            .string()
            .regex(/^sites\/[0-9a-f-]{36}\/assets\/[0-9a-f-]{36}\/[a-z0-9]+\.[a-z0-9]{2,4}$/),
        )
        .max(8),
    })
    .safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'Invalid request' }, 400);
  const role = await siteRole(c.env, c.get('token'), parsed.data.siteId, c.get('userId'));
  if (!role || role === 'viewer') return c.json({ error: 'Forbidden' }, 403);
  // The asset row is already gone (delete_asset), which is what authorizes removing its bytes; keys must belong to the site.
  const keys = parsed.data.keys.filter((k) => k.startsWith(`sites/${parsed.data.siteId}/`));
  await Promise.all(keys.map((k) => c.env.ASSETS.delete(k)));
  return c.json({ deleted: keys.length });
});

// ---------------------------------------------------------------------------
// Public form submissions (from the live site). Validation happens in submit_form() under anon.
// ---------------------------------------------------------------------------
const formCors = cors({
  origin: '*',
  allowMethods: ['POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Accept'],
  maxAge: 600,
});
app.options('/forms/:formId', (c, next) => formCors(c, next));

// ponytail: per-isolate in-memory rate limit (best effort on Workers); move to KV/Durable Objects if abuse appears.
const buckets = new Map<string, { n: number; reset: number }>();
function rateLimited(key: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { n: 1, reset: now + windowMs });
    return false;
  }
  b.n += 1;
  return b.n > limit;
}

app.post('/forms/:formId', formCors, async (c) => {
  const formId = c.req.param('formId');
  if (!uuid.safeParse(formId).success) return c.json({ ok: false, error: 'Unknown form.' }, 404);
  const wantsJson = (c.req.header('Accept') ?? '').includes('application/json');
  const fail = (message: string, status: 400 | 404 | 413 | 422 | 429 | 500) => {
    if (wantsJson) return c.json({ ok: false, error: message }, status);
    const back = c.req.header('Referer') ?? '/';
    return c.redirect(
      `${back.split('#')[0]}${back.includes('?') ? '&' : '?'}error=${encodeURIComponent(message)}`,
      303,
    );
  };
  const ip = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? 'local';
  if (rateLimited(`${ip}:${formId}`))
    return fail('Too many submissions. Please wait a minute and try again.', 429);
  if (Number(c.req.header('Content-Length') ?? 0) > 64 * 1024)
    return fail('Submission too large.', 413);

  let raw: Record<string, unknown>;
  try {
    const ct = c.req.header('Content-Type') ?? '';
    raw = ct.includes('application/json')
      ? ((await c.req.json()) as Record<string, unknown>)
      : Object.fromEntries((await c.req.formData()).entries());
  } catch {
    return fail('Could not read the submission.', 400);
  }
  if (typeof raw !== 'object' || raw === null || Object.keys(raw).length > 40)
    return fail('Invalid submission.', 400);
  // Bot checks: honeypot must be empty; the form must have been open for at least 3 seconds and less than a day.
  if (typeof raw.website === 'string' && raw.website.trim() !== '')
    return fail('Submission rejected.', 422);
  const ts = Number(raw._ts);
  if (!Number.isFinite(ts) || Date.now() - ts < 3000 || Date.now() - ts > 86_400_000)
    return fail('Please try sending the form again.', 422);
  const { website: _hp, _ts: _t, _page, ...data } = raw;
  for (const [k, v] of Object.entries(data)) if (v === 'true' || v === 'on') data[k] = true;
  for (const k of Object.keys(data)) if (data[k] === 'false' || data[k] === '') delete data[k];

  const res = await fetch(`${c.env.SUPABASE_URL}/rest/v1/rpc/submit_form`, {
    method: 'POST',
    headers: {
      apikey: c.env.SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${c.env.SUPABASE_PUBLISHABLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      p_form: formId,
      p_data: data,
      p_meta: {
        page: typeof _page === 'string' ? _page : undefined,
        referer: c.req.header('Referer'),
        userAgent: c.req.header('User-Agent'),
      },
    }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string; details?: string };
    const msg = err.message ?? '';
    const human = msg.includes('missing_required')
      ? `Please fill in the required field “${err.details}”.`
      : msg.includes('invalid_email')
        ? 'Please enter a valid email address.'
        : msg.includes('too_long')
          ? 'One of the answers is too long.'
          : msg.includes('form not found')
            ? 'Unknown form.'
            : 'We could not save your message. Please try again.';
    return fail(human, msg.includes('form not found') ? 404 : res.status === 400 ? 422 : 500);
  }
  const formDef = await fetch(`${c.env.SUPABASE_URL}/rest/v1/rpc/get_public_form`, {
    method: 'POST',
    headers: {
      apikey: c.env.SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${c.env.SUPABASE_PUBLISHABLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ p_form: formId }),
  })
    .then((r) => (r.ok ? (r.json() as Promise<{ settings?: { successMessage?: string } }>) : null))
    .catch(() => null);
  const message = formDef?.settings?.successMessage ?? 'Thanks, we received your message.';
  if (wantsJson) return c.json({ ok: true, message });
  const back = (c.req.header('Referer') ?? '/').split('#')[0] as string;
  return c.redirect(`${back}${back.includes('?') ? '&' : '?'}submitted=${formId}#${formId}`, 303);
});

// ---------------------------------------------------------------------------
// Cache purge after publish. Active only when CF_ZONE_ID + CF_API_TOKEN are configured; otherwise a no-op
// that says so, and the short s-maxage on published responses does the work.
// ---------------------------------------------------------------------------
app.post('/cache/purge', async (c) => {
  const auth = c.req.header('Authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const user = token ? await getUser(c.env, token) : null;
  if (!user) return c.json({ error: 'Sign in required' }, 401);
  const parsed = z
    .object({ siteId: uuid, urls: z.array(z.url()).min(1).max(30) })
    .safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'Invalid request' }, 400);
  const role = await siteRole(c.env, token, parsed.data.siteId, user.id);
  if (!role || role === 'viewer' || role === 'editor')
    return c.json({ error: 'Publishers only' }, 403);
  if (!c.env.CF_ZONE_ID || !c.env.CF_API_TOKEN)
    return c.json({ purged: false, reason: 'not-configured' });
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${c.env.CF_ZONE_ID}/purge_cache`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${c.env.CF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ files: parsed.data.urls }),
    },
  );
  const body = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    errors?: Array<{ message: string }>;
  };
  if (!res.ok || !body.success)
    return c.json(
      { purged: false, reason: body.errors?.[0]?.message ?? `Cloudflare responded ${res.status}` },
      502,
    );
  return c.json({ purged: true, count: parsed.data.urls.length });
});

app.get('/health', (c) => c.json({ ok: true }));
// The worker is an API, not a website: say so instead of a bare 404 at the root.
app.get('/', (c) =>
  c.json({
    service: 'siteos-edge',
    ok: true,
    endpoints: ['/health', '/assets/*', '/uploads/*', '/forms/:formId', '/cache/purge'],
  }),
);

/** Magic-byte check so a renamed .exe cannot be stored as an image. */
export function sniffMatches(head: Uint8Array, mime: string): boolean {
  const startsWith = (...bytes: number[]) => bytes.every((b, i) => head[i] === b);
  const ascii = (s: string, at = 0) => [...s].every((ch, i) => head[at + i] === ch.charCodeAt(0));
  switch (mime) {
    case 'image/jpeg':
      return startsWith(0xff, 0xd8, 0xff);
    case 'image/png':
      return startsWith(0x89, 0x50, 0x4e, 0x47);
    case 'image/gif':
      return ascii('GIF8');
    case 'image/webp':
      return ascii('RIFF') && ascii('WEBP', 8);
    case 'application/pdf':
      return ascii('%PDF');
    default:
      return false;
  }
}

export default app;
