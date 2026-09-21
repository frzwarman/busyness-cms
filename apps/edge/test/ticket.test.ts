import { describe, expect, it } from 'vitest';
import { sniffMatches } from '../src/index.ts';
import { signTicket, verifyTicket } from '../src/ticket.ts';

const t = {
  siteId: 's',
  assetId: 'a',
  userId: 'u',
  variants: ['original'],
  mimes: { original: 'image/png' },
  exp: Date.now() + 60_000,
};

describe('upload tickets', () => {
  it('round-trips and rejects tampering and expiry', async () => {
    const tok = await signTicket(t, 'secret');
    expect(await verifyTicket(tok, 'secret')).toEqual(t);
    expect(await verifyTicket(tok, 'other')).toBeNull();
    expect(await verifyTicket(`${tok}x`, 'secret')).toBeNull();
    const [body] = tok.split('.');
    expect(await verifyTicket(`${body}.AAAA`, 'secret')).toBeNull();
    expect(
      await verifyTicket(await signTicket({ ...t, exp: Date.now() - 1 }, 'secret'), 'secret'),
    ).toBeNull();
  });
});

describe('magic bytes', () => {
  it('matches declared types only', () => {
    expect(sniffMatches(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]), 'image/jpeg')).toBe(true);
    expect(sniffMatches(new Uint8Array([0x89, 0x50, 0x4e, 0x47]), 'image/jpeg')).toBe(false);
    expect(sniffMatches(new TextEncoder().encode('RIFF....WEBPVP8 '), 'image/webp')).toBe(true);
    expect(sniffMatches(new TextEncoder().encode('%PDF-1.7'), 'application/pdf')).toBe(true);
    expect(sniffMatches(new TextEncoder().encode('MZ......'), 'image/png')).toBe(false);
    expect(sniffMatches(new TextEncoder().encode('<svg'), 'image/svg+xml')).toBe(false);
  });
});
