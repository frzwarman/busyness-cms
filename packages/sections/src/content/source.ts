import { z } from 'zod';

/**
 * Where a list section gets its items. `manual` = the items typed into the section. `collection` = the site's
 * content library, filtered by tag or by picked entries, resolved into `items` at preview and publish time.
 */
export const contentSourceSchema = z.object({
  mode: z.enum(['manual', 'collection']).default('manual'),
  selection: z.enum(['all', 'tag', 'picked']).default('all'),
  tag: z.string().max(40).default(''),
  ids: z.array(z.uuid()).max(50).default([]),
  limit: z.number().int().min(1).max(50).default(12),
});
export type ContentSource = z.infer<typeof contentSourceSchema>;
export const manualSource: ContentSource = {
  mode: 'manual',
  selection: 'all',
  tag: '',
  ids: [],
  limit: 12,
};

/** Adds `source` to a section schema and a migration step that back-fills it. */
export const addSourceMigration = (from: number) => ({
  from,
  to: from + 1,
  migrate: (props: Record<string, unknown>) => ({ ...props, source: props.source ?? manualSource }),
});
