import type { Wireframe } from './types.ts';

export type WireToken = 'E' | 'H' | 'T' | 'B' | 'M' | 'C' | 'L' | 'I';
export type WireRow = { background: boolean; columns: WireToken[][] };

const tokens = new Set<string>(['E', 'H', 'T', 'B', 'M', 'C', 'L', 'I']);

/** Parse the thumbnail DSL into rows/columns of tokens. Unknown characters are ignored. */
export function parseWireframe(wire: Wireframe): WireRow[] {
  return wire.map((line) => {
    const background = line.startsWith('*');
    const body = background ? line.slice(1) : line;
    const columns = body
      .split('|')
      .map((col) => [...col].filter((ch) => tokens.has(ch)) as WireToken[]);
    return { background, columns };
  });
}
