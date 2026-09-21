import type { SectionInstance } from '@siteos/schemas';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { demoAboutPage, demoHomePage } from '../src/fixtures/index.ts';
import {
  defineSection,
  embedFor,
  migrateSection,
  parseWireframe,
  registry,
  SectionRegistry,
} from '../src/index.ts';

describe('defineSection', () => {
  it('rejects defaults that fail the schema', () => {
    expect(() =>
      defineSection({
        type: 'bad',
        title: 'Bad',
        description: '',
        category: 'content',
        schemaVersion: 1,
        schema: z.object({ variant: z.enum(['a']), heading: z.string().min(1) }),
        defaults: { variant: 'a', heading: '' },
        variants: [{ value: 'a', label: 'A', thumbnail: ['H'] }],
        inspector: [],
      }),
    ).toThrow(/defaults do not satisfy schema/);
  });
  it('rejects variants the schema does not accept', () => {
    expect(() =>
      defineSection({
        type: 'bad',
        title: 'Bad',
        description: '',
        category: 'content',
        schemaVersion: 1,
        schema: z.object({ variant: z.enum(['a']) }),
        defaults: { variant: 'a' },
        variants: [
          { value: 'a', label: 'A', thumbnail: ['H'] },
          { value: 'zzz', label: 'Z', thumbnail: ['H'] },
        ],
        inspector: [],
      }),
    ).toThrow(/variant "zzz"/);
  });
});

describe('registry', () => {
  it('creates sections with defaults and stable ids', () => {
    const s = registry.create('hero', { variant: 'centered' });
    expect(s.id).toMatch(/^sec_/);
    expect(s.schemaVersion).toBe(1);
    expect(s.props.variant).toBe('centered');
    expect(s.props.heading).toBeTypeOf('string');
    expect(registry.create('hero').id).not.toBe(s.id);
  });
  it('throws on unknown types when creating', () => {
    expect(() => registry.create('carousel-9000')).toThrow(/Unknown section type/);
  });
  it('keeps unknown sections intact instead of dropping them', () => {
    const unknown: SectionInstance = {
      id: 'sec_unknown00001',
      type: 'legacy-widget',
      schemaVersion: 3,
      hidden: false,
      props: { a: 1 },
    };
    const r = registry.validate(unknown);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.reason).toBe('unknown-type');
      expect(r.section).toEqual(unknown);
    }
  });
  it('reports invalid props with paths', () => {
    const r = registry.validate({
      id: 'sec_invalid000001',
      type: 'hero',
      schemaVersion: 1,
      hidden: false,
      props: { variant: 'split', heading: '' },
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.join()).toMatch(/heading/);
  });
  it('normalizes the demo fixtures without issues', () => {
    for (const page of [demoHomePage, demoAboutPage]) {
      const { issues, document } = registry.normalizeDocument(page);
      expect(issues).toEqual([]);
      expect(document.sections).toHaveLength(page.sections.length);
    }
  });
  it('searches by title, keywords and category', () => {
    expect(registry.search('banner').map((d) => d.type)).toEqual(
      expect.arrayContaining(['hero', 'cta']),
    );
    expect(registry.search('conversion').map((d) => d.type)).toEqual(['cta']);
    expect(registry.search('')).toHaveLength(registry.list().length);
  });
  it('every definition has a variant thumbnail that parses', () => {
    for (const def of registry.list()) {
      for (const v of def.variants) {
        const rows = parseWireframe(v.thumbnail);
        expect(rows.length, `${def.type}/${v.value}`).toBeGreaterThan(0);
      }
    }
  });
});

describe('migrations', () => {
  const v2 = defineSection({
    type: 'quote',
    title: 'Quote',
    description: '',
    category: 'content',
    schemaVersion: 3,
    schema: z.object({
      variant: z.enum(['plain']),
      text: z.string(),
      author: z.object({ name: z.string(), role: z.string().default('') }),
    }),
    defaults: { variant: 'plain', text: 'Hi', author: { name: 'A', role: '' } },
    variants: [{ value: 'plain', label: 'Plain', thumbnail: ['T'] }],
    inspector: [],
    migrations: [
      // v2 → v3: nest author fields (out of order on purpose; defineSection sorts)
      {
        from: 2,
        to: 3,
        migrate: ({ authorName, ...rest }) => ({
          ...rest,
          author: { name: String(authorName ?? ''), role: '' },
        }),
      },
      // v1 → v2: rename `quote` to `text`, keep everything else
      { from: 1, to: 2, migrate: ({ quote, ...rest }) => ({ ...rest, text: quote }) },
    ],
  });
  const reg = new SectionRegistry([v2]);

  it('applies the chain in order, preserving unrelated fields', () => {
    const r = reg.validate({
      id: 'sec_mig000000001',
      type: 'quote',
      schemaVersion: 1,
      hidden: false,
      props: { variant: 'plain', quote: 'Great coffee', authorName: 'Sari' },
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.migrated).toBe(true);
      expect(r.section.schemaVersion).toBe(3);
      expect(r.section.props).toEqual({
        variant: 'plain',
        text: 'Great coffee',
        author: { name: 'Sari', role: '' },
      });
    }
  });
  it('does not mutate the stored section', () => {
    const stored: SectionInstance = {
      id: 'sec_mig000000002',
      type: 'quote',
      schemaVersion: 1,
      hidden: false,
      props: { variant: 'plain', quote: 'x', authorName: 'y' },
    };
    const copy = structuredClone(stored);
    reg.validate(stored);
    expect(stored).toEqual(copy);
  });
  it('flags future versions and gaps instead of guessing', () => {
    const future = migrateSection(v2, {
      id: 'sec_mig000000003',
      type: 'quote',
      schemaVersion: 9,
      hidden: false,
      props: {},
    });
    expect(future.ok).toBe(false);
    if (!future.ok) expect(future.reason).toBe('future-version');
    const gapDef = { ...v2, migrations: v2.migrations.filter((m) => m.from !== 2) };
    const gap = migrateSection(gapDef, {
      id: 'sec_mig000000004',
      type: 'quote',
      schemaVersion: 1,
      hidden: false,
      props: { quote: 'x' },
    });
    expect(gap.ok).toBe(false);
    if (!gap.ok) expect(gap.reason).toBe('migration-gap');
  });
  it('rejects migrations that skip versions at definition time', () => {
    expect(() =>
      defineSection({ ...v2, migrations: [{ from: 1, to: 3, migrate: (p) => p }] }),
    ).toThrow(/step by one/);
  });
});

describe('thumbnail DSL', () => {
  it('parses rows, columns and background rows', () => {
    expect(parseWireframe(['E H T B | M', '*M H'])).toEqual([
      { background: false, columns: [['E', 'H', 'T', 'B'], ['M']] },
      { background: true, columns: [['M', 'H']] },
    ]);
  });
});

describe('section library', () => {
  it('has at least 20 section types, each with valid defaults for every variant', () => {
    expect(registry.list().length).toBeGreaterThanOrEqual(20);
    for (const def of registry.list()) {
      for (const v of def.variants) {
        const r = def.schema.safeParse({ ...def.defaults, variant: v.value });
        expect(r.success, `${def.type}/${v.value}: ${r.success ? '' : r.error.message}`).toBe(true);
      }
      // Every inspector path exists in the defaults (catches typos in definitions).
      for (const g of def.inspector)
        for (const f of g.fields)
          expect(f.path in def.defaults, `${def.type}.${f.path}`).toBe(true);
      // list controls: newItem() must satisfy the item schema
      for (const g of def.inspector)
        for (const f of g.fields)
          if (f.control === 'list') {
            const arr = registry.create(def.type).props[f.path] as unknown[];
            const withNew = def.schema.safeParse({
              ...def.defaults,
              [f.path]: [...arr.slice(0, 1), f.newItem()],
            });
            expect(
              withNew.success,
              `${def.type}.${f.path} newItem: ${withNew.success ? '' : withNew.error.message}`,
            ).toBe(true);
          }
    }
  });

  it('migrates image-text v1 plain body to v2 rich text', () => {
    const r = registry.validate({
      id: 'sec_mig000000010',
      type: 'image-text',
      schemaVersion: 1,
      hidden: false,
      props: {
        variant: 'image-left',
        heading: 'H',
        body: 'One.\n\nTwo.',
        image: null,
        imageRatio: 'landscape',
        cta: null,
        theme: 'light',
        spacing: 'standard',
      },
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.section.schemaVersion).toBe(2);
      expect((r.section.props.body as { content: unknown[] }).content).toHaveLength(2);
    }
  });

  it('video embeds are privacy-enhanced and reject unknown hosts', () => {
    expect(embedFor('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toEqual({
      kind: 'youtube',
      src: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    });
    expect(embedFor('https://youtu.be/dQw4w9WgXcQ')?.kind).toBe('youtube');
    expect(embedFor('https://vimeo.com/123456789')).toEqual({
      kind: 'vimeo',
      src: 'https://player.vimeo.com/video/123456789?dnt=1',
    });
    expect(embedFor('https://evil.example/video')).toBeNull();
  });
});
