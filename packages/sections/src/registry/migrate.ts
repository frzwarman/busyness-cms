import type { SectionInstance } from '@siteos/schemas';
import type { SectionDefinition } from './types.ts';

export type MigrationOutcome =
  | { ok: true; section: SectionInstance; migrated: boolean }
  | { ok: false; reason: 'future-version' | 'migration-gap'; errors: string[] };

/** Walk the migration chain from the stored version to the current one. Never mutates input. */
export function migrateSection(def: SectionDefinition, section: SectionInstance): MigrationOutcome {
  if (section.schemaVersion === def.schemaVersion) return { ok: true, section, migrated: false };
  if (section.schemaVersion > def.schemaVersion) {
    return {
      ok: false,
      reason: 'future-version',
      errors: [
        `Section "${def.type}" is stored at v${section.schemaVersion} but this build only understands v${def.schemaVersion}.`,
      ],
    };
  }
  let version = section.schemaVersion;
  let props: Record<string, unknown> = structuredClone(section.props);
  while (version < def.schemaVersion) {
    const step = def.migrations.find((m) => m.from === version);
    if (!step) {
      return {
        ok: false,
        reason: 'migration-gap',
        errors: [`No migration for "${def.type}" from v${version} to v${version + 1}.`],
      };
    }
    props = step.migrate(props);
    version = step.to;
  }
  return { ok: true, section: { ...section, schemaVersion: version, props }, migrated: true };
}
