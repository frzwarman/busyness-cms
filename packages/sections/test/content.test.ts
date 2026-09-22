import type { PageDocument } from '@siteos/schemas';
import { describe, expect, it } from 'vitest';
import { collections, hasReferences, registry, resolveDocument } from '../src/index.ts';

const entry = (id: string, tags: string[], name: string) => ({
  id,
  collection: 'testimonials',
  tags,
  data: { quote: `Q ${name}`, name, role: '', image: null, rating: 5 },
});
const entries = [
  entry('11111111-1111-4111-8111-111111111111', ['home'], 'A'),
  entry('22222222-2222-4222-8222-222222222222', [], 'B'),
  entry('33333333-3333-4333-8333-333333333333', ['home'], 'C'),
];

function page(sections: PageDocument['sections']): PageDocument {
  return { id: 'p', slug: '/', title: 'T', seo: { noindex: false }, sections };
}

describe('content collections', () => {
  it('every bound section has a collection whose schema accepts the section’s own default items', () => {
    for (const def of registry.list()) {
      if (!def.collection) continue;
      const col = collections.find((c) => c.id === def.collection?.id);
      expect(col, def.type).toBeDefined();
      for (const item of def.defaults[def.collection.itemsPath] as unknown[])
        expect(col?.schema.safeParse(item).success, `${def.type} item into ${col?.id}`).toBe(true);
      // the collection's inspector paths exist on a new item
      const fresh = col?.newItem() ?? {};
      for (const f of col?.fields ?? [])
        expect((f.path.split('.')[0] as string) in fresh, `${col?.id}.${f.path}`).toBe(true);
    }
  });

  it('v1 sections without a source migrate to manual mode', () => {
    const r = registry.validate({
      id: 'sec_mig000000020',
      type: 'testimonials',
      schemaVersion: 1,
      hidden: false,
      props: { ...registry.require('testimonials').defaults, source: undefined },
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect((r.section.props.source as { mode: string }).mode).toBe('manual');
  });

  it('resolves tag, picked and all selections with limits, and leaves manual sections alone', () => {
    const base = registry.create('testimonials');
    const manual = page([base]);
    expect(hasReferences(manual, registry)).toBe(false);
    expect(resolveDocument(manual, { entries, globals: [] }, registry)).toEqual(manual);

    const byTag = registry.create('testimonials', {
      source: { mode: 'collection', selection: 'tag', tag: 'home', ids: [], limit: 12 },
    });
    const r1 = resolveDocument(page([byTag]), { entries, globals: [] }, registry);
    expect(
      ((r1.sections[0]?.props.items as Array<{ name: string }> | undefined) ?? []).map(
        (i) => i.name,
      ),
    ).toEqual(['A', 'C']);

    const picked = registry.create('testimonials', {
      source: {
        mode: 'collection',
        selection: 'picked',
        tag: '',
        ids: [entries[1]?.id ?? '', entries[0]?.id ?? '', '44444444-4444-4444-8444-444444444444'],
        limit: 12,
      },
    });
    const r2 = resolveDocument(page([picked]), { entries, globals: [] }, registry);
    expect(
      ((r2.sections[0]?.props.items as Array<{ name: string }> | undefined) ?? []).map(
        (i) => i.name,
      ),
    ).toEqual(['B', 'A']);

    const all = registry.create('testimonials', {
      source: { mode: 'collection', selection: 'all', tag: '', ids: [], limit: 2 },
    });
    const r3 = resolveDocument(page([all]), { entries, globals: [] }, registry);
    expect(((r3.sections[0]?.props.items as unknown[] | undefined) ?? []).length).toBe(2);
    expect(hasReferences(page([all]), registry)).toBe(true);
  });

  it('keeps manual items when the collection has no matches', () => {
    const s = registry.create('testimonials', {
      source: { mode: 'collection', selection: 'tag', tag: 'nope', ids: [], limit: 12 },
    });
    const r = resolveDocument(page([s]), { entries, globals: [] }, registry);
    expect(r.sections[0]?.props.items).toEqual(s.props.items);
  });

  it('substitutes global sections by id and preserves page identity', () => {
    const placeholder = {
      ...registry.create('cta'),
      globalId: '55555555-5555-4555-8555-555555555555',
      hidden: true,
    };
    const globals = [
      {
        id: placeholder.globalId as string,
        name: 'Footer',
        section: { type: 'footer', schemaVersion: 1, props: registry.require('footer').defaults },
      },
    ];
    const r = resolveDocument(page([placeholder]), { entries: [], globals }, registry);
    expect(r.sections[0]).toMatchObject({
      id: placeholder.id,
      type: 'footer',
      hidden: true,
      globalId: placeholder.globalId,
    });
    // missing global → placeholder kept
    const r2 = resolveDocument(page([placeholder]), { entries: [], globals: [] }, registry);
    expect(r2.sections[0]?.type).toBe('cta');
  });
});
