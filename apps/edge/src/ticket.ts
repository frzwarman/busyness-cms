/**
 * Upload tickets: a signed, short-lived statement "user U may PUT these variants for asset A of site S".
 * Verifying a ticket needs no network call, so each PUT is cheap. HMAC-SHA256 over the JSON payload.
 */
export type Ticket = {
  siteId: string;
  assetId: string;
  userId: string;
  variants: string[];
  mimes: Record<string, string>;
  exp: number;
};

const enc = new TextEncoder();
const b64url = (buf: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
const unb64url = (s: string) =>
  Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

async function key(secret: string) {
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function signTicket(t: Ticket, secret: string): Promise<string> {
  const body = b64url(enc.encode(JSON.stringify(t)));
  const sig = await crypto.subtle.sign('HMAC', await key(secret), enc.encode(body));
  return `${body}.${b64url(sig)}`;
}

export async function verifyTicket(
  token: string,
  secret: string,
  now = Date.now(),
): Promise<Ticket | null> {
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const ok = await crypto.subtle.verify('HMAC', await key(secret), unb64url(sig), enc.encode(body));
  if (!ok) return null;
  try {
    const t = JSON.parse(new TextDecoder().decode(unb64url(body))) as Ticket;
    if (typeof t.exp !== 'number' || t.exp < now) return null;
    return t;
  } catch {
    return null;
  }
}
