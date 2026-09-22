import type { z } from 'zod';
import type { AnyObjectSchema, SectionDefinition } from './types.ts';

type DefineInput<S extends AnyObjectSchema> = Omit<
  SectionDefinition<S>,
  | 'migrations'
  | 'capabilities'
  | 'performance'
  | 'recommendedFor'
  | 'keywords'
  | 'defaults'
  | 'collection'
> & {
  collection?: SectionDefinition<S>['collection'];
  defaults: z.input<S>;
  migrations?: SectionDefinition<S>['migrations'];
  capabilities?: Partial<SectionDefinition<S>['capabilities']>;
  performance?: Partial<SectionDefinition<S>['performance']>;
  recommendedFor?: string[];
  keywords?: string[];
};

/**
 * Single source of truth for a section. Fails fast at module load if the defaults
 * don't satisfy the schema or if variants disagree with the schema's `variant` enum.
 */
export function defineSection<S extends AnyObjectSchema>(
  input: DefineInput<S>,
): SectionDefinition<S> {
  const parsed = input.schema.safeParse(input.defaults);
  if (!parsed.success) {
    throw new Error(
      `Section "${input.type}": defaults do not satisfy schema: ${parsed.error.message}`,
    );
  }
  const variantValues = input.variants.map((v) => v.value);
  for (const v of variantValues) {
    if (!input.schema.safeParse({ ...(parsed.data as object), variant: v }).success) {
      throw new Error(`Section "${input.type}": variant "${v}" is not accepted by the schema`);
    }
  }
  const migrations = [...(input.migrations ?? [])].sort((a, b) => a.from - b.from);
  for (const m of migrations) {
    if (m.to !== m.from + 1)
      throw new Error(`Section "${input.type}": migration ${m.from}→${m.to} must step by one`);
  }
  return {
    ...input,
    defaults: parsed.data as z.output<S>,
    migrations,
    capabilities: { theme: true, spacing: true, responsive: [], ...input.capabilities },
    performance: {
      javascript: 'none',
      expectedImages: 0,
      imagePriority: 'low',
      ...input.performance,
    },
    recommendedFor: input.recommendedFor ?? [],
    keywords: input.keywords ?? [],
  };
}
