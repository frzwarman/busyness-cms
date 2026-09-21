import { describe, expect, it } from 'vitest';
import { DraftConflictError, slugForSite } from '../src/index.ts';

describe('slugForSite', () => {
  it('produces unique, url-safe slugs', () => {
    const a = slugForSite('Kopi Sudut — Bogor!');
    expect(a).toMatch(/^kopi-sudut-bogor-[a-z0-9]{4}$/);
    expect(slugForSite('Kopi Sudut')).not.toBe(slugForSite('Kopi Sudut'));
    expect(slugForSite('***')).toMatch(/^site-[a-z0-9]{4}$/);
  });
});

describe('DraftConflictError', () => {
  it('carries the current revision and a user-facing message', () => {
    const e = new DraftConflictError(7);
    expect(e.currentRevision).toBe(7);
    expect(e.message).toMatch(/Reload/);
  });
});
