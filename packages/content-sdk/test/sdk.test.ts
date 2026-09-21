import { describe, expect, it } from 'vitest';
import { createHttpContentSource, publishedPageSchema, siteSlugSchema } from '../src/index.ts';

const site = {
  id: 's1',
  name: 'Kopi',
  slug: 'kopi-1a2b',
  theme: undefined,
  pages: [{ id: 'p1', slug: '/', title: 'Home' }],
};

describe('content sdk', () => {
  it('validates site slugs before hitting the database', () => {
    expect(siteSlugSchema.safeParse('kopi-sudut-ab12').success).toBe(true);
    for (const bad of ['Kopi', 'a b', '-x', 'x-', "x'--", ''])
      expect(siteSlugSchema.safeParse(bad).success, bad).toBe(false);
  });

  it('rejects payloads that are not published shapes', () => {
    expect(publishedPageSchema.safeParse({ page: {}, site }).success).toBe(false);
  });

  it('http source maps 404 to null and encodes paths', async () => {
    const calls: string[] = [];
    const fetchImpl = (async (url: string) => {
      calls.push(url);
      return new Response('nope', { status: 404 });
    }) as unknown as typeof fetch;
    const src = createHttpContentSource('https://example.com/', fetchImpl);
    expect(await src.getPage('kopi-1a2b', '/')).toBeNull();
    expect(await src.getPage('kopi-1a2b', '/menu/lunch')).toBeNull();
    expect(await src.getSite('kopi-1a2b')).toBeNull();
    expect(calls).toEqual([
      'https://example.com/api/content/sites/kopi-1a2b/pages/',
      'https://example.com/api/content/sites/kopi-1a2b/pages/menu/lunch',
      'https://example.com/api/content/sites/kopi-1a2b',
    ]);
  });
});
