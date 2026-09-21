import { supabase } from '@/lib/supabase';
import type { ResizeRequest, ResizeResult } from './resize.worker';

export const EDGE_ORIGIN = import.meta.env.VITE_EDGE_ORIGIN ?? 'http://localhost:8787';
export const VARIANT_WIDTHS = [1920, 960, 320] as const;
export const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
];
export const MAX_BYTES = 25 * 1024 * 1024;

export type UploadStage =
  | 'hashing'
  | 'resizing'
  | 'authorizing'
  | 'uploading'
  | 'registering'
  | 'done';
export type UploadOutcome =
  | { kind: 'uploaded'; assetId: string; urls: Record<string, string> }
  | { kind: 'duplicate'; assetId: string; filename: string };

export async function sha256Hex(blob: Blob): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer());
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

let worker: Worker | null = null;
function resize(file: Blob, widths: number[]): Promise<ResizeResult> {
  worker ??= new Worker(new URL('./resize.worker.ts', import.meta.url), { type: 'module' });
  const id = crypto.randomUUID();
  return new Promise((resolve) => {
    const onMessage = (e: MessageEvent<ResizeResult>) => {
      if (e.data.id !== id) return;
      worker?.removeEventListener('message', onMessage);
      resolve(e.data);
    };
    worker?.addEventListener('message', onMessage);
    worker?.postMessage({ id, file, widths } satisfies ResizeRequest);
  });
}

async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error('Sign in required');
  return { Authorization: `Bearer ${data.session.access_token}` };
}

async function edge<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${EDGE_ORIGIN}${path}`, init);
  const body = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(body.error ?? `Upload service error (${res.status})`);
  return body;
}

/**
 * Browser → edge → R2 pipeline: hash (dedupe), resize in a worker, authorize, PUT each variant, register.
 * Nothing is reported as uploaded until the edge confirms the metadata row exists.
 */
export async function uploadAsset(
  file: File,
  siteId: string,
  onStage: (s: UploadStage, detail?: string) => void = () => {},
): Promise<UploadOutcome> {
  if (!ACCEPTED_TYPES.includes(file.type))
    throw new Error(
      `“${file.name}” is a ${file.type || 'unknown'} file. Use JPEG, PNG, WebP, GIF or PDF.`,
    );
  if (file.size > MAX_BYTES) throw new Error(`“${file.name}” is larger than 25 MB.`);
  onStage('hashing');
  const sha256 = await sha256Hex(file);

  const isImage = file.type.startsWith('image/') && file.type !== 'image/gif';
  let width: number | null = null;
  let height: number | null = null;
  const variants: Array<{
    name: 'original' | '1920' | '960' | '320';
    blob: Blob;
    mimeType: string;
    width: number | null;
    height: number | null;
  }> = [{ name: 'original', blob: file, mimeType: file.type, width: null, height: null }];
  if (isImage) {
    onStage('resizing');
    const r = await resize(file, [...VARIANT_WIDTHS]);
    if ('error' in r) throw new Error(r.error);
    width = r.original.width;
    height = r.original.height;
    variants[0] = { ...(variants[0] as (typeof variants)[0]), width, height };
    for (const v of r.variants)
      variants.push({
        name: String(v.target) as '1920' | '960' | '320',
        blob: v.blob,
        mimeType: 'image/webp',
        width: v.width,
        height: v.height,
      });
  }

  onStage('authorizing');
  const headers = await authHeaders();
  const meta = {
    siteId,
    filename: file.name,
    mimeType: file.type,
    size: file.size,
    sha256,
    width,
    height,
    variants: variants.map((v) => ({
      name: v.name,
      mimeType: v.mimeType,
      size: v.blob.size,
      width: v.width,
      height: v.height,
    })),
  };
  const auth = await edge<{
    duplicate?: { id: string; filename: string };
    assetId?: string;
    ticket?: string;
    uploads?: Array<{ name: string; url: string }>;
  }>('/uploads/authorize', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(meta),
  });
  if (auth.duplicate)
    return { kind: 'duplicate', assetId: auth.duplicate.id, filename: auth.duplicate.filename };
  if (!auth.assetId || !auth.ticket || !auth.uploads)
    throw new Error('Upload service returned an unexpected response');

  for (const v of variants) {
    const target = auth.uploads.find((u) => u.name === v.name);
    if (!target) throw new Error(`No upload slot for ${v.name}`);
    onStage('uploading', v.name);
    await edge(target.url, {
      method: 'PUT',
      headers: {
        ...headers,
        'X-Upload-Ticket': auth.ticket,
        'Content-Type': v.mimeType,
        'Content-Length': String(v.blob.size),
      },
      body: v.blob,
    });
  }

  onStage('registering');
  const done = await edge<{ assetId: string; urls: Record<string, string> }>(
    `/uploads/${auth.assetId}/complete`,
    {
      method: 'POST',
      headers: { ...headers, 'X-Upload-Ticket': auth.ticket, 'Content-Type': 'application/json' },
      body: JSON.stringify(meta),
    },
  );
  onStage('done');
  return { kind: 'uploaded', assetId: done.assetId, urls: done.urls };
}

/** Remove R2 objects after delete_asset() succeeded. */
export async function deleteAssetObjects(siteId: string, keys: string[]): Promise<void> {
  if (!keys.length) return;
  const headers = await authHeaders();
  await edge('/uploads/objects', {
    method: 'DELETE',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ siteId, keys }),
  });
}

/** Public URL for a stored variant key. */
export function assetUrl(key: string): string {
  const base = import.meta.env.VITE_ASSET_BASE_URL ?? `${EDGE_ORIGIN}/assets`;
  return `${base}/${key}`;
}
