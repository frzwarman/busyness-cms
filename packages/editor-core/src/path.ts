/** Tiny dot-path helpers for props patches. Immutable: returns new objects along the path. */
export function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc === null || typeof acc !== 'object') return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

export function setPath<T extends Record<string, unknown>>(
  obj: T,
  path: string,
  value: unknown,
): T {
  const keys = path.split('.');
  const walk = (node: unknown, i: number): unknown => {
    const key = keys[i] as string;
    const base = node !== null && typeof node === 'object' ? (node as Record<string, unknown>) : {};
    if (i === keys.length - 1) return { ...base, [key]: value };
    return { ...base, [key]: walk(base[key], i + 1) };
  };
  return walk(obj, 0) as T;
}
