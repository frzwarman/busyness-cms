# Section migrations

Every persisted section carries `schemaVersion`. A page saved in 2026 must still open in 2029.

## When to bump

Bump `schemaVersion` whenever a change would make previously saved `props` fail the new schema or mean
something different: renaming a field, changing an enum value, moving data into a nested object, changing a
type (e.g. plain text → rich text document). Adding an optional field with a default does **not** need a bump.

## How

1. Increment `schemaVersion` in `definition.ts`.
2. Add a migration stepping exactly one version:

```ts
migrations: [
  {
    from: 1,
    to: 2,
    // Deterministic. Keep everything you don't understand.
    migrate: ({ quote, ...rest }) => ({ ...rest, text: quote }),
  },
],
```

3. Add a test with a real v1 fixture and assert the v2 result, and that unrelated fields survive.

## Runtime behaviour (`registry.validate`)

| Stored version vs current | Result |
|---------------------------|--------|
| equal | parse props |
| lower, chain complete | apply each step, then parse; `migrated: true` |
| lower, step missing | `reason: 'migration-gap'`, section kept untouched |
| higher | `reason: 'future-version'`, section kept untouched |
| type unknown | `reason: 'unknown-type'`, section kept untouched |

`normalizeDocument()` runs this over a whole page and returns `issues` for the editor to display. Nothing is
ever silently dropped. Migration never mutates the stored object (it works on a `structuredClone`).

## Rules

- One step per version; `defineSection` rejects `from: 1, to: 3`.
- Pure functions: no dates, randomness or network.
- Never delete fields you don't recognise; spread `...rest`.
- Migrated drafts are written back at the new version on the next save; published versions are
  migrated on read and left immutable on disk.
