/** Stable, URL-safe ids. Sections are `sec_xxxxxxxxxxxx`; never array indexes. */
export function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
}
