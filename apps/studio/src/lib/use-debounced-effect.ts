import { type DependencyList, useEffect } from 'react';

/** useEffect that fires `delay` ms after the last change of `deps`. */
export function useDebouncedEffect(effect: () => void, deps: DependencyList, delay: number) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: the caller owns the dependency list, exactly like useEffect
  useEffect(() => {
    const t = setTimeout(effect, delay);
    return () => clearTimeout(t);
  }, [...deps, delay]);
}
