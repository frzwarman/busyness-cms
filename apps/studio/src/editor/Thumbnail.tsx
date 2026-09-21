import { parseWireframe, type Wireframe, type WireToken } from '@siteos/sections';
import { cn } from '@/lib/utils';

/** Renders the registry's wireframe DSL as a schematic preview. Purely data-driven; no per-section art. */
export function Thumbnail({ wire, className }: { wire: Wireframe; className?: string }) {
  const rows = parseWireframe(wire);
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex aspect-[16/10] w-full flex-col gap-1.5 rounded-md border bg-card p-2',
        className,
      )}
    >
      {rows.map((row, ri) => {
        const key = `${ri}-${row.columns.length}`;
        if (row.background) {
          return (
            <div
              key={key}
              className="flex flex-1 flex-col items-start justify-end gap-1 rounded-sm bg-muted-foreground/25 p-1.5"
            >
              {row.columns[0]
                ?.filter((t) => t !== 'M')
                .map((t, i) => (
                  <Token key={`${t}${i}`} token={t} onDark />
                ))}
            </div>
          );
        }
        return (
          <div key={key} className="flex flex-1 items-stretch gap-1.5">
            {row.columns.map((col, ci) => (
              <div
                key={`${ci}-${col.join('')}`}
                className="flex flex-1 flex-col justify-center gap-1"
              >
                {col.map((t, i) => (
                  <Token key={`${t}${i}`} token={t} />
                ))}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function Token({ token, onDark = false }: { token: WireToken; onDark?: boolean }) {
  const bar = onDark ? 'bg-white/80' : 'bg-foreground/70';
  const soft = onDark ? 'bg-white/50' : 'bg-foreground/30';
  switch (token) {
    case 'E':
      return (
        <span
          className={cn('h-1 w-[30%] rounded-full', onDark ? 'bg-white/70' : 'bg-primary/70')}
        />
      );
    case 'H':
      return <span className={cn('h-2 w-[75%] rounded-sm', bar)} />;
    case 'T':
      return (
        <span className="flex flex-col gap-0.5">
          <span className={cn('h-1 w-[90%] rounded-full', soft)} />
          <span className={cn('h-1 w-[70%] rounded-full', soft)} />
        </span>
      );
    case 'B':
      return (
        <span className={cn('h-2.5 w-[36%] rounded-full', onDark ? 'bg-white' : 'bg-primary')} />
      );
    case 'M':
      return <span className="min-h-4 flex-1 rounded-sm bg-muted-foreground/25" />;
    case 'C':
      return (
        <span className="min-h-6 flex-1 rounded-md border-2 border-foreground/30 bg-muted/60" />
      );
    case 'L':
      return <span className="size-3 rounded-full bg-foreground/40" />;
    case 'I':
      return <span className="size-3 rounded-sm bg-primary/60" />;
  }
}
