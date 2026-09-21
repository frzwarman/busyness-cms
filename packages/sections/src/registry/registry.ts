import { createId, type PageDocument, type SectionInstance } from '@siteos/schemas';
import { migrateSection } from './migrate.ts';
import type { SectionCategory, SectionDefinition, ValidationResult } from './types.ts';

export type DocumentIssue = { sectionId: string; type: string; errors: string[]; reason: string };

export class SectionRegistry {
  private readonly defs = new Map<string, SectionDefinition>();

  constructor(definitions: SectionDefinition[]) {
    for (const d of definitions) {
      if (this.defs.has(d.type)) throw new Error(`Duplicate section type "${d.type}"`);
      this.defs.set(d.type, d);
    }
  }

  get(type: string): SectionDefinition | undefined {
    return this.defs.get(type);
  }

  require(type: string): SectionDefinition {
    const d = this.defs.get(type);
    if (!d) throw new Error(`Unknown section type "${type}"`);
    return d;
  }

  has(type: string): boolean {
    return this.defs.has(type);
  }

  list(): SectionDefinition[] {
    return [...this.defs.values()];
  }

  byCategory(category: SectionCategory): SectionDefinition[] {
    return this.list().filter((d) => d.category === category);
  }

  search(query: string): SectionDefinition[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.list();
    return this.list().filter((d) =>
      [d.title, d.description, d.category, ...d.keywords].some((s) => s.toLowerCase().includes(q)),
    );
  }

  /** New instance with defaults applied; `variant` may pick one of the definition's variants. */
  create(type: string, overrides: Record<string, unknown> = {}): SectionInstance {
    const def = this.require(type);
    const props = def.schema.parse({ ...def.defaults, ...overrides }) as Record<string, unknown>;
    return { id: createId('sec'), type, schemaVersion: def.schemaVersion, hidden: false, props };
  }

  /** Migrate then validate. Unknown/invalid sections are returned intact, never dropped. */
  validate(section: SectionInstance): ValidationResult {
    const def = this.defs.get(section.type);
    if (!def) {
      return {
        ok: false,
        reason: 'unknown-type',
        section,
        errors: [`Unknown section type "${section.type}".`],
      };
    }
    const migrated = migrateSection(def, section);
    if (!migrated.ok)
      return { ok: false, reason: migrated.reason, section, errors: migrated.errors };
    const parsed = def.schema.safeParse(migrated.section.props);
    if (!parsed.success) {
      return {
        ok: false,
        reason: 'invalid-props',
        section,
        errors: parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`),
      };
    }
    return {
      ok: true,
      migrated: migrated.migrated,
      section: { ...migrated.section, props: parsed.data as Record<string, unknown> },
    };
  }

  /**
   * Normalize a whole document: migrate what can be migrated, keep the rest untouched,
   * and report issues so the editor can show them instead of silently dropping content.
   */
  normalizeDocument(doc: PageDocument): { document: PageDocument; issues: DocumentIssue[] } {
    const issues: DocumentIssue[] = [];
    const sections = doc.sections.map((s) => {
      const r = this.validate(s);
      if (r.ok) return r.section;
      issues.push({ sectionId: s.id, type: s.type, errors: r.errors, reason: r.reason });
      return s;
    });
    return { document: { ...doc, sections }, issues };
  }
}
