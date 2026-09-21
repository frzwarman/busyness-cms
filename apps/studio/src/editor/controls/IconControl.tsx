import { type IconName, iconNames, iconPaths } from '@siteos/sections';
import { Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export function IconGlyph({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className ?? 'size-5'}
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}

/** Picks from the curated icon set the public site can render without JavaScript. */
export function IconControl({
  id,
  value,
  onChange,
  allowNone = true,
}: {
  id: string;
  value: IconName | null;
  onChange: (v: IconName | null) => void;
  allowNone?: boolean;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button id={id} variant="outline" size="sm" className="w-full justify-start gap-2">
          {value ? (
            <IconGlyph name={value} className="size-4" />
          ) : (
            <Ban className="size-4 text-muted-foreground" />
          )}
          <span className="capitalize">{value ? value.replace('-', ' ') : 'No icon'}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <ul className="grid grid-cols-6 gap-1" aria-label="Icons">
          {allowNone && (
            <li>
              <button
                type="button"
                onClick={() => onChange(null)}
                aria-label="No icon"
                aria-pressed={value === null}
                className={cn(
                  'grid size-9 place-items-center rounded-md hover:bg-muted',
                  value === null && 'bg-muted ring-1 ring-foreground',
                )}
              >
                <Ban className="size-4 text-muted-foreground" />
              </button>
            </li>
          )}
          {iconNames.map((n) => (
            <li key={n}>
              <button
                type="button"
                onClick={() => onChange(n)}
                aria-label={n}
                aria-pressed={value === n}
                className={cn(
                  'grid size-9 place-items-center rounded-md hover:bg-muted',
                  value === n && 'bg-muted ring-1 ring-foreground',
                )}
              >
                <IconGlyph name={n} className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
