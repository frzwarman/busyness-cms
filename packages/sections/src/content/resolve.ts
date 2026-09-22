import type { FormDefinition, PageDocument, SectionInstance } from '@siteos/schemas';
import type { SectionRegistry } from '../registry/registry.ts';
import { contentSourceSchema } from './source.ts';

export type ContentEntry = {
  id: string;
  collection: string;
  data: Record<string, unknown>;
  tags: string[];
};
export type GlobalSection = {
  id: string;
  name: string;
  section: { type: string; schemaVersion: number; props: Record<string, unknown> };
};
export type ResolveInputs = {
  entries: ContentEntry[];
  globals: GlobalSection[];
  forms?: FormDefinition[];
};

/**
 * Turn references into content: collection-sourced sections get their `items` filled from the library, and
 * global placeholders take the global's type/props (keeping the page-level id and hidden flag). Pure and
 * deterministic; the Studio runs it before preview and publish, so published versions are self-contained.
 */
export function resolveDocument(
  doc: PageDocument,
  inputs: ResolveInputs,
  registry: SectionRegistry,
): PageDocument {
  return { ...doc, sections: doc.sections.map((s) => resolveSection(s, inputs, registry)) };
}

export function resolveSection(
  section: SectionInstance,
  inputs: ResolveInputs,
  registry: SectionRegistry,
): SectionInstance {
  let s = section;
  if (s.globalId) {
    const g = inputs.globals.find((x) => x.id === s.globalId);
    // A missing global keeps the placeholder content so nothing is lost; the editor flags it.
    if (g)
      s = {
        ...s,
        type: g.section.type,
        schemaVersion: g.section.schemaVersion,
        props: structuredClone(g.section.props),
      };
  }
  // Form sections inline their form definition so the public page needs no lookup.
  if (s.type === 'contact-form' && typeof s.props.formId === 'string') {
    const f = inputs.forms?.find((x) => x.id === s.props.formId);
    s = { ...s, props: { ...s.props, form: f ? structuredClone(f) : (s.props.form ?? null) } };
  }
  const def = registry.get(s.type);
  if (!def?.collection) return s;
  const parsed = contentSourceSchema.safeParse(s.props.source);
  if (!parsed.success || parsed.data.mode !== 'collection') return s;
  const src = parsed.data;
  let items = inputs.entries.filter((e) => e.collection === def.collection?.id);
  if (src.selection === 'tag' && src.tag) items = items.filter((e) => e.tags.includes(src.tag));
  if (src.selection === 'picked')
    items = src.ids
      .map((id) => items.find((e) => e.id === id))
      .filter((e): e is ContentEntry => Boolean(e));
  const data = items.slice(0, src.limit).map((e) => structuredClone(e.data));
  // A collection section with no matching entries keeps its manual items so the page never renders empty.
  return {
    ...s,
    props: {
      ...s.props,
      [def.collection.itemsPath]: data.length ? data : s.props[def.collection.itemsPath],
    },
  };
}

/** Does this document depend on library content or globals (i.e. does it need resolving)? */
export function hasReferences(doc: PageDocument, registry: SectionRegistry): boolean {
  return doc.sections.some(
    (s) =>
      s.globalId ||
      (s.type === 'contact-form' && s.props.formId) ||
      (registry.get(s.type)?.collection &&
        (s.props.source as { mode?: string } | undefined)?.mode === 'collection'),
  );
}
