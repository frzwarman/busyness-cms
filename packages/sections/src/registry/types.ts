import type { SectionInstance } from '@siteos/schemas';
import type { z } from 'zod';

export type SectionCategory =
  | 'navigation'
  | 'hero'
  | 'content'
  | 'features'
  | 'social-proof'
  | 'media'
  | 'conversion'
  | 'information'
  | 'business'
  | 'footer';

export const sectionCategories: Array<{ id: SectionCategory; label: string }> = [
  { id: 'navigation', label: 'Navigation' },
  { id: 'hero', label: 'Hero' },
  { id: 'content', label: 'Content' },
  { id: 'features', label: 'Features & services' },
  { id: 'social-proof', label: 'Social proof' },
  { id: 'media', label: 'Media' },
  { id: 'conversion', label: 'Conversion' },
  { id: 'information', label: 'Information' },
  { id: 'business', label: 'Business specific' },
  { id: 'footer', label: 'Footer' },
];

/**
 * Wireframe thumbnail DSL, one string per row. Columns are separated by `|`.
 * Tokens: E eyebrow, H heading, T text, B button, M media, C card, L logo, I icon.
 * Prefix a row with `*` to draw it as a full-bleed background with the rest stacked on top.
 */
export type Wireframe = string[];

export type SectionVariant<V extends string = string> = {
  value: V;
  label: string;
  description?: string;
  thumbnail: Wireframe;
};

export type SelectOption = { value: string; label: string };

export type InspectorControl =
  | { control: 'text'; maxLength?: number; placeholder?: string }
  | { control: 'textarea'; rows?: number; maxLength?: number }
  | { control: 'number'; min?: number; max?: number; step?: number }
  | { control: 'select'; options: SelectOption[] }
  | { control: 'segmented'; options: SelectOption[] }
  | { control: 'toggle' }
  | { control: 'image' }
  | { control: 'button' }
  | { control: 'link' }
  | { control: 'icon' }
  | { control: 'richtext' }
  | {
      control: 'list';
      /** Singular label for items, e.g. "Feature". */
      itemLabel: string;
      /** Field paths are relative to the item. */
      fields: InspectorField[];
      /** Item prop shown as the row title in the editor. */
      titlePath?: string;
      max?: number;
      /** Factory for a new item; must satisfy the item schema. */
      newItem: () => Record<string, unknown>;
    };

export type InspectorField = {
  /** Dot path inside `props`, e.g. `primaryCta.label` */
  path: string;
  label: string;
  description?: string;
  /** Marks a field the Studio may expose for per-breakpoint overrides (only if capabilities allow). */
  responsive?: boolean;
} & InspectorControl;

export type InspectorGroup = {
  id: string;
  label: string;
  fields: InspectorField[];
  /** Only show the group when `props[path]` is one of `values`. */
  showWhen?: { path: string; values: string[] };
};

export type SectionCapabilities = {
  theme: boolean;
  spacing: boolean;
  /** Prop paths that may be overridden per breakpoint. */
  responsive: string[];
};

export type SectionPerformance = {
  javascript: 'none' | 'island';
  expectedImages: number;
  imagePriority: 'high' | 'low';
};

export type SectionMigration = {
  from: number;
  to: number;
  /** Must be deterministic and must not discard fields it doesn't understand. */
  migrate: (props: Record<string, unknown>) => Record<string, unknown>;
};

// biome-ignore lint/suspicious/noExplicitAny: variance-erased object schema for registry storage
export type AnyObjectSchema = z.ZodObject<any>;

export type SectionDefinition<S extends AnyObjectSchema = AnyObjectSchema> = {
  type: string;
  title: string;
  description: string;
  category: SectionCategory;
  schemaVersion: number;
  schema: S;
  defaults: z.output<S>;
  variants: ReadonlyArray<SectionVariant>;
  inspector: InspectorGroup[];
  migrations: SectionMigration[];
  capabilities: SectionCapabilities;
  performance: SectionPerformance;
  /** Business pack ids this section is recommended for (suggestions only). */
  recommendedFor: string[];
  keywords: string[];
};

export type ValidationFailure = {
  ok: false;
  reason: 'unknown-type' | 'future-version' | 'migration-gap' | 'invalid-props';
  section: SectionInstance;
  errors: string[];
};
export type ValidationSuccess = { ok: true; section: SectionInstance; migrated: boolean };
export type ValidationResult = ValidationSuccess | ValidationFailure;
