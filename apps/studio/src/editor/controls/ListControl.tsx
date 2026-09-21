import { getPath, setPath } from '@siteos/editor-core';
import type { InspectorField } from '@siteos/sections';
import { ChevronDown, ChevronRight, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Item = Record<string, unknown> | string;

/**
 * Generic repeatable-items editor driven by the registry: reorder with buttons (keyboard friendly),
 * add/remove within the definition's limits, nested lists supported. Items with no fields are plain strings.
 */
export function ListControl({
  id,
  label,
  items,
  itemLabel,
  fields,
  titlePath,
  max,
  newItem,
  onChange,
  renderField,
}: {
  id: string;
  label: string;
  items: Item[];
  itemLabel: string;
  fields: InspectorField[];
  titlePath?: string;
  max?: number;
  newItem: () => Record<string, unknown>;
  onChange: (items: Item[]) => void;
  /** Renders one field for one item; provided by the Inspector so all controls stay in one place. */
  renderField: (
    field: InspectorField,
    value: unknown,
    onChange: (v: unknown) => void,
    id: string,
  ) => ReactNode;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const plain = fields.length === 0;
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m as Item);
    onChange(next);
    setOpen(to);
  };
  const titleOf = (it: Item, i: number) => {
    if (typeof it === 'string') return it || `${itemLabel} ${i + 1}`;
    const t = titlePath ? getPath(it, titlePath) : undefined;
    return typeof t === 'string' && t.trim() ? t : `${itemLabel} ${i + 1}`;
  };

  return (
    <div className="grid gap-1.5" role="group" aria-label={label}>
      <ol className="grid gap-1">
        {items.map((it, i) => {
          const isOpen = open === i;
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: list items have no identity of their own; order is the identity
            <li key={i} className="rounded-md border">
              <div className="flex items-center gap-1 pr-1">
                {plain ? (
                  <Input
                    value={it as string}
                    onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
                    className="h-8 border-0 shadow-none focus-visible:ring-0"
                    aria-label={`${itemLabel} ${i + 1}`}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex min-w-0 flex-1 items-center gap-1.5 px-2 py-1.5 text-left text-sm"
                  >
                    {isOpen ? (
                      <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
                    )}
                    <span className="truncate">{titleOf(it, i)}</span>
                  </button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={`Move ${itemLabel.toLowerCase()} ${i + 1} up`}
                  disabled={i === 0}
                  onClick={() => move(i, i - 1)}
                >
                  <ChevronUp />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={`Move ${itemLabel.toLowerCase()} ${i + 1} down`}
                  disabled={i === items.length - 1}
                  onClick={() => move(i, i + 1)}
                >
                  <ChevronDown />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-destructive"
                  aria-label={`Remove ${itemLabel.toLowerCase()} ${i + 1}`}
                  onClick={() => {
                    onChange(items.filter((_, j) => j !== i));
                    setOpen(null);
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
              {isOpen && !plain && (
                <div className={cn('grid gap-3 border-t bg-muted/30 p-2.5')}>
                  {fields.map((f) => (
                    <div key={f.path} className="grid gap-1.5">
                      <span className="text-xs font-medium">{f.label}</span>
                      {renderField(
                        f,
                        getPath(it, f.path),
                        (v) =>
                          onChange(
                            items.map((x, j) =>
                              j === i ? setPath(x as Record<string, unknown>, f.path, v) : x,
                            ),
                          ),
                        `${id}-${i}-${f.path.replace(/\./g, '-')}`,
                      )}
                    </div>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <Button
        id={id}
        variant="outline"
        size="sm"
        className="justify-start"
        disabled={max !== undefined && items.length >= max}
        onClick={() => {
          const n = newItem();
          onChange([...items, n]);
          setOpen(items.length);
        }}
      >
        <Plus data-icon="inline-start" /> Add {itemLabel.toLowerCase()}
        {max !== undefined ? (
          <span className="ml-auto text-muted-foreground">
            {items.length}/{max}
          </span>
        ) : null}
      </Button>
    </div>
  );
}
