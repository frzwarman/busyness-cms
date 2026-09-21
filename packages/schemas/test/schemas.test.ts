import { describe, expect, it } from 'vitest';
import {
  createId,
  focalToObjectPosition,
  isTrustedOrigin,
  linkSchema,
  pageDocumentSchema,
  previewToStudioMessageSchema,
  resolveLink,
  sectionInstanceSchema,
  slugSchema,
  studioToPreviewMessageSchema,
} from '../src/index.ts';

describe('ids', () => {
  it('creates prefixed ids that satisfy the section id pattern', () => {
    const id = createId('sec');
    expect(sectionInstanceSchema.shape.id.safeParse(id).success).toBe(true);
    expect(createId('sec')).not.toBe(id);
  });
});

describe('slugs', () => {
  it.each(['/', '/about', '/menu/lunch-specials'])('accepts %s', (s) => {
    expect(slugSchema.safeParse(s).success).toBe(true);
  });
  it.each(['about', '/About', '/a b', '/trailing/', ''])('rejects %j', (s) => {
    expect(slugSchema.safeParse(s).success).toBe(false);
  });
});

describe('links', () => {
  const resolver = { slugForPage: (id: string) => (id === 'p1' ? '/about' : undefined) };
  it('resolves every kind', () => {
    expect(resolveLink({ kind: 'page', pageId: 'p1' }, resolver)).toBe('/about');
    expect(resolveLink({ kind: 'page', pageId: 'p1', anchor: 'team' }, resolver)).toBe(
      '/about#team',
    );
    expect(resolveLink({ kind: 'page', pageId: 'missing' }, resolver)).toBeUndefined();
    expect(resolveLink({ kind: 'url', href: 'https://x.io', newTab: false }, resolver)).toBe(
      'https://x.io',
    );
    expect(resolveLink({ kind: 'email', email: 'a@b.co' }, resolver)).toBe('mailto:a@b.co');
    expect(resolveLink({ kind: 'phone', phone: '+62 (21) 555-0100' }, resolver)).toBe(
      'tel:+62215550100',
    );
    expect(resolveLink({ kind: 'anchor', anchor: 'menu' }, resolver)).toBe('#menu');
  });
  it('rejects javascript: urls', () => {
    expect(linkSchema.safeParse({ kind: 'url', href: 'javascript:alert(1)' }).success).toBe(false);
  });
});

describe('images', () => {
  it('maps focal point to object-position', () => {
    expect(focalToObjectPosition({ focalX: 0.63, focalY: 0.31 })).toBe('63% 31%');
  });
});

describe('page document', () => {
  it('parses a minimal page and applies defaults', () => {
    const doc = pageDocumentSchema.parse({
      id: 'page_home',
      slug: '/',
      title: 'Home',
      sections: [{ id: 'sec_abcdef123456', type: 'hero', schemaVersion: 1, props: {} }],
    });
    expect(doc.seo.noindex).toBe(false);
    expect(doc.sections[0]?.hidden).toBe(false);
  });
});

describe('preview protocol', () => {
  it('parses every iframe → studio message (discriminator map is built lazily in Zod 4)', () => {
    const msgs = [
      { v: 1, type: 'siteos:ready' },
      { v: 1, type: 'siteos:rendered', ok: true, height: 1200 },
      { v: 1, type: 'siteos:rendered', ok: false, error: 'boom' },
      { v: 1, type: 'siteos:selected', sectionId: 'sec_abcdef123456', fieldPath: 'heading' },
    ];
    for (const m of msgs)
      expect(previewToStudioMessageSchema.safeParse(m).success, m.type).toBe(true);
  });
  it('rejects unknown message types and wildcard origins', () => {
    expect(
      studioToPreviewMessageSchema.safeParse({ v: 1, type: 'siteos:eval', code: '1' }).success,
    ).toBe(false);
    expect(isTrustedOrigin('http://localhost:5173', '*')).toBe(false);
    expect(isTrustedOrigin('http://localhost:5173', 'http://localhost:5173')).toBe(true);
  });
});
