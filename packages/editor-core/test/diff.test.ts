import { registry } from '@siteos/sections';
import { demoHomePage } from '@siteos/sections/fixtures';
import { describe, expect, it } from 'vitest';
import { describeChanges, summarizeChange } from '../src/index.ts';

const base = () => structuredClone(demoHomePage);

describe('describeChanges', () => {
  it('reports nothing for identical documents', () => {
    expect(describeChanges(base(), base(), registry)).toEqual({ page: [], sections: [] });
  });

  it('names changed fields with inspector labels', () => {
    const next = base();
    (next.sections[0] as { props: Record<string, unknown> }).props.heading = 'New';
    (next.sections[0] as { props: Record<string, unknown> }).props.primaryCta = null;
    const d = describeChanges(base(), next, registry);
    expect(d.sections).toEqual([
      {
        sectionId: 'sec_demo00000001',
        title: 'Hero',
        kind: 'changed',
        fields: ['Heading', 'Primary button'],
      },
    ]);
    expect(summarizeChange(d.sections[0] as NonNullable<(typeof d.sections)[0]>)).toBe(
      'Heading, Primary button changed',
    );
  });

  it('detects add, remove, reorder and hide', () => {
    const prev = base();
    const next = base();
    const [s0, s1, s2] = next.sections as [
      (typeof next.sections)[0],
      (typeof next.sections)[0],
      (typeof next.sections)[0],
    ];
    next.sections = [s2, s0, { ...s1, hidden: true }];
    next.sections.push({
      id: 'sec_new000000001',
      type: 'cta',
      schemaVersion: 1,
      hidden: false,
      props: { variant: 'card', heading: 'Hi' },
    });
    next.sections.splice(0, 1); // remove the cta that was first
    const d = describeChanges(prev, next, registry);
    const kinds = d.sections.map((s) => `${s.title}:${s.kind}`);
    expect(kinds).toContain('Call to action:removed');
    expect(kinds).toContain('Call to action:added');
    expect(kinds).toContain('Image + Text:hidden');
    expect(kinds).not.toContain('Hero:moved'); // hero is still first among survivors
  });

  it('reports layout and page-level changes', () => {
    const next = base();
    next.title = 'Front page';
    (next.sections[0] as { props: Record<string, unknown> }).props.variant = 'centered';
    const d = describeChanges(base(), next, registry);
    expect(d.page).toEqual(['Page title changed']);
    expect(d.sections[0]?.fields).toEqual(['Layout']);
  });
});
