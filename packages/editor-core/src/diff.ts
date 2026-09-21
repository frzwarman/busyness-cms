import type { PageDocument, SectionInstance } from '@siteos/schemas';
import type { SectionRegistry } from '@siteos/sections';

export type SectionChange = {
  sectionId: string;
  title: string;
  kind: 'added' | 'removed' | 'moved' | 'hidden' | 'shown' | 'changed';
  /** Human-readable field labels that changed (only for kind 'changed'). */
  fields: string[];
};

export type DocumentDiff = { page: string[]; sections: SectionChange[] };

/**
 * Human-readable difference between two page documents: "Hero — Heading changed", "Testimonials — Reordered",
 * "Pricing — Removed". Deterministic and registry-driven so labels match the inspector.
 */
export function describeChanges(
  prev: PageDocument,
  next: PageDocument,
  registry: SectionRegistry,
): DocumentDiff {
  const page: string[] = [];
  if (prev.title !== next.title) page.push('Page title changed');
  if (prev.slug !== next.slug) page.push(`Address changed from ${prev.slug} to ${next.slug}`);
  if (JSON.stringify(prev.seo) !== JSON.stringify(next.seo)) page.push('SEO settings changed');

  const before = new Map(prev.sections.map((s, i) => [s.id, { s, i }]));
  const after = new Map(next.sections.map((s, i) => [s.id, { s, i }]));
  const title = (s: SectionInstance) => registry.get(s.type)?.title ?? s.type;
  const sections: SectionChange[] = [];

  for (const [id, { s }] of before)
    if (!after.has(id))
      sections.push({ sectionId: id, title: title(s), kind: 'removed', fields: [] });
  for (const [id, { s }] of after)
    if (!before.has(id))
      sections.push({ sectionId: id, title: title(s), kind: 'added', fields: [] });

  // Order: compare the sequence of surviving ids.
  const survivingBefore = prev.sections.filter((s) => after.has(s.id)).map((s) => s.id);
  const survivingAfter = next.sections.filter((s) => before.has(s.id)).map((s) => s.id);
  const moved = new Set<string>();
  survivingAfter.forEach((id, i) => {
    if (survivingBefore[i] !== id) moved.add(id);
  });

  for (const id of survivingAfter) {
    const a = before.get(id)?.s as SectionInstance;
    const b = after.get(id)?.s as SectionInstance;
    if (a.hidden !== b.hidden)
      sections.push({
        sectionId: id,
        title: title(b),
        kind: b.hidden ? 'hidden' : 'shown',
        fields: [],
      });
    const fields = changedFields(a, b, registry);
    if (fields.length) sections.push({ sectionId: id, title: title(b), kind: 'changed', fields });
    if (moved.has(id)) sections.push({ sectionId: id, title: title(b), kind: 'moved', fields: [] });
  }
  return { page, sections };
}

function changedFields(
  a: SectionInstance,
  b: SectionInstance,
  registry: SectionRegistry,
): string[] {
  const def = registry.get(b.type);
  const labels = new Map<string, string>();
  if (def) for (const g of def.inspector) for (const f of g.fields) labels.set(f.path, f.label);
  const out: string[] = [];
  if (a.props.variant !== b.props.variant) out.push('Layout');
  if (a.props.theme !== b.props.theme) out.push('Theme');
  if (a.props.spacing !== b.props.spacing) out.push('Spacing');
  const keys = new Set([...Object.keys(a.props), ...Object.keys(b.props)]);
  for (const key of keys) {
    if (key === 'variant' || key === 'theme' || key === 'spacing') continue;
    if (JSON.stringify(a.props[key]) === JSON.stringify(b.props[key])) continue;
    // Prefer the most specific inspector label for this key (e.g. "primaryCta" → "Primary button").
    const label =
      labels.get(key) ??
      [...labels.entries()].find(([p]) => p.startsWith(`${key}.`))?.[1] ??
      humanize(key);
    if (!out.includes(label)) out.push(label);
  }
  return out;
}

function humanize(key: string): string {
  const spaced = key
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function summarizeChange(c: SectionChange): string {
  switch (c.kind) {
    case 'added':
      return 'Added';
    case 'removed':
      return 'Removed';
    case 'moved':
      return 'Reordered';
    case 'hidden':
      return 'Hidden';
    case 'shown':
      return 'Shown';
    case 'changed':
      return `${c.fields.join(', ')} changed`;
  }
}
