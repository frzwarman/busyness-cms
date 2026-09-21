import { registry } from '@siteos/sections';
import { demoHomePage } from '@siteos/sections/fixtures';
import { describe, expect, it } from 'vitest';
import {
  COALESCE_WINDOW_MS,
  createEditorReducer,
  createEditorState,
  getPath,
  selectors,
  setPath,
} from '../src/index.ts';

const reduce = createEditorReducer(registry);
const init = () => createEditorState(structuredClone(demoHomePage));
const ids = (s: ReturnType<typeof init>) => s.document.sections.map((x) => x.type);

describe('path helpers', () => {
  it('sets nested values immutably', () => {
    const a = { x: { y: 1 }, z: 2 };
    const b = setPath(a, 'x.y', 5);
    expect(b).toEqual({ x: { y: 5 }, z: 2 });
    expect(a.x.y).toBe(1);
    expect(getPath(b, 'x.y')).toBe(5);
    expect(getPath(b, 'nope.deeper')).toBeUndefined();
    expect(setPath({}, 'a.b.c', 1)).toEqual({ a: { b: { c: 1 } } });
  });
});

describe('editor reducer', () => {
  it('adds a section with defaults and selects it', () => {
    const s = reduce(init(), { type: 'addSection', sectionType: 'cta', index: 1 });
    expect(ids(s)).toEqual(['hero', 'cta', 'image-text', 'cta']);
    expect(s.selectedSectionId).toBe(s.document.sections[1]?.id);
    expect(s.dirty).toBe(true);
  });

  it('moves sections by id, keeping ids stable', () => {
    const s0 = init();
    const testimonialsLike = s0.document.sections[2]?.id as string;
    const s = reduce(s0, { type: 'moveSection', sectionId: testimonialsLike, toIndex: 1 });
    expect(ids(s)).toEqual(['hero', 'cta', 'image-text']);
    expect(s.document.sections[1]?.id).toBe(testimonialsLike);
    expect(reduce(s, { type: 'moveSection', sectionId: 'sec_missing', toIndex: 0 })).toBe(s);
  });

  it('duplicates with a fresh id right after the source', () => {
    const s0 = init();
    const s = reduce(s0, { type: 'duplicateSection', sectionId: 'sec_demo00000001' });
    expect(ids(s)).toEqual(['hero', 'hero', 'image-text', 'cta']);
    expect(s.document.sections[1]?.id).not.toBe('sec_demo00000001');
    expect(s.document.sections[1]?.props).toEqual(s0.document.sections[0]?.props);
  });

  it('removes and selects a neighbour', () => {
    const s = reduce(
      { ...init(), selectedSectionId: 'sec_demo00000003' },
      { type: 'removeSection', sectionId: 'sec_demo00000003' },
    );
    expect(ids(s)).toEqual(['hero', 'image-text']);
    expect(s.selectedSectionId).toBe('sec_demo00000002');
  });

  it('updates nested props by path', () => {
    const s = reduce(init(), {
      type: 'updateProps',
      sectionId: 'sec_demo00000001',
      path: 'primaryCta.label',
      value: 'Order now',
      at: 1000,
    });
    expect(getPath(selectors.selectedSection(s)?.props, 'primaryCta.label')).toBe('Order now');
  });

  it('coalesces rapid edits to the same field into one undo step', () => {
    let s = init();
    s = reduce(s, {
      type: 'updateProps',
      sectionId: 'sec_demo00000001',
      path: 'heading',
      value: 'C',
      at: 1000,
    });
    s = reduce(s, {
      type: 'updateProps',
      sectionId: 'sec_demo00000001',
      path: 'heading',
      value: 'Co',
      at: 1100,
    });
    s = reduce(s, {
      type: 'updateProps',
      sectionId: 'sec_demo00000001',
      path: 'heading',
      value: 'Cof',
      at: 1200,
    });
    expect(s.past).toHaveLength(1);
    s = reduce(s, {
      type: 'updateProps',
      sectionId: 'sec_demo00000001',
      path: 'heading',
      value: 'Coffee',
      at: 1200 + COALESCE_WINDOW_MS + 1,
    });
    expect(s.past).toHaveLength(2);
    s = reduce(s, {
      type: 'updateProps',
      sectionId: 'sec_demo00000001',
      path: 'eyebrow',
      value: 'x',
      at: 1200 + COALESCE_WINDOW_MS + 2,
    });
    expect(s.past).toHaveLength(3);
    s = reduce(s, { type: 'undo' });
    expect(s.document.sections[0]?.props.heading).toBe('Coffee');
    s = reduce(s, { type: 'undo' });
    expect(s.document.sections[0]?.props.heading).toBe('Cof');
    s = reduce(s, { type: 'undo' });
    expect(s.document.sections[0]?.props.heading).toBe('Coffee worth slowing down for');
  });

  it('undo/redo round-trips structural changes and clears redo on new edits', () => {
    const s0 = init();
    const s1 = reduce(s0, { type: 'removeSection', sectionId: 'sec_demo00000002' });
    const s2 = reduce(s1, { type: 'undo' });
    expect(s2.document).toEqual(s0.document);
    expect(selectors.canRedo(s2)).toBe(true);
    const s3 = reduce(s2, { type: 'redo' });
    expect(s3.document).toEqual(s1.document);
    const s4 = reduce(reduce(s3, { type: 'undo' }), {
      type: 'toggleHidden',
      sectionId: 'sec_demo00000001',
    });
    expect(selectors.canRedo(s4)).toBe(false);
    expect(reduce(s0, { type: 'undo' })).toBe(s0);
  });

  it('markSaved clears dirty without touching history', () => {
    const s = reduce(reduce(init(), { type: 'renamePage', title: 'Front page' }), {
      type: 'markSaved',
    });
    expect(s.dirty).toBe(false);
    expect(selectors.canUndo(s)).toBe(true);
  });
});
