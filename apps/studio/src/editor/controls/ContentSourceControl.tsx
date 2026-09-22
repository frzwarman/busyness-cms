import { type ContentSource, collectionById } from '@siteos/sections';
import { useQuery } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { entriesQuery } from '../content/content-queries';
import { useEditor } from '../EditorProvider';
import { Segmented } from './Segmented';

/** Manual items vs. the content library (all / by tag / picked entries). Shows how many entries will appear. */
export function ContentSourceControl({
  id,
  value,
  collectionId,
  onChange,
}: {
  id: string;
  value: ContentSource;
  collectionId: string;
  onChange: (v: ContentSource) => void;
}) {
  const { siteId } = useEditor();
  const { data: entries } = useQuery(entriesQuery(siteId));
  const col = collectionById(collectionId);
  const inCollection = (entries ?? []).filter((e) => e.collection === collectionId);
  const tags = [...new Set(inCollection.flatMap((e) => e.tags))].sort();
  const matching =
    value.selection === 'tag'
      ? inCollection.filter((e) => e.tags.includes(value.tag))
      : value.selection === 'picked'
        ? inCollection.filter((e) => value.ids.includes(e.id))
        : inCollection;
  const titleOf = (data: Record<string, unknown>) =>
    String((col && data[col.titlePath]) || 'Untitled');

  return (
    <div className="grid gap-2.5">
      <Segmented
        id={id}
        label="Items come from"
        value={value.mode}
        options={[
          { value: 'manual', label: 'This section' },
          { value: 'collection', label: `${col?.label ?? 'Library'}` },
        ]}
        onChange={(mode) => onChange({ ...value, mode: mode as ContentSource['mode'] })}
      />
      {value.mode === 'collection' && (
        <div className="grid gap-2.5 rounded-md border p-2.5">
          {inCollection.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No {col?.label.toLowerCase() ?? 'entries'} in your library yet. Add some in the
              Content tab; until then this section keeps its own items.
            </p>
          ) : (
            <>
              <Segmented
                label="Selection"
                value={value.selection}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'tag', label: 'By tag' },
                  { value: 'picked', label: 'Pick' },
                ]}
                onChange={(selection) =>
                  onChange({ ...value, selection: selection as ContentSource['selection'] })
                }
              />
              {value.selection === 'tag' && (
                <div className="grid gap-1.5">
                  <Label htmlFor={`${id}-tag`} className="text-xs">
                    Tag
                  </Label>
                  <Input
                    id={`${id}-tag`}
                    list={`${id}-tags`}
                    value={value.tag}
                    onChange={(e) => onChange({ ...value, tag: e.target.value.trim() })}
                    placeholder="e.g. home"
                  />
                  <datalist id={`${id}-tags`}>
                    {tags.map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                </div>
              )}
              {value.selection === 'picked' && (
                <ul className="grid max-h-56 gap-1 overflow-auto" aria-label="Pick entries">
                  {inCollection.map((e) => {
                    const on = value.ids.includes(e.id);
                    return (
                      <li key={e.id}>
                        <button
                          type="button"
                          aria-pressed={on}
                          onClick={() =>
                            onChange({
                              ...value,
                              ids: on ? value.ids.filter((x) => x !== e.id) : [...value.ids, e.id],
                            })
                          }
                          className={cn(
                            'flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-left text-xs hover:bg-muted',
                            on && 'border-foreground',
                          )}
                        >
                          <span
                            className={cn(
                              'grid size-4 place-items-center rounded border',
                              on && 'bg-foreground text-background',
                            )}
                          >
                            {on && <Check className="size-3" />}
                          </span>
                          <span className="truncate">{titleOf(e.data)}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              <div className="grid gap-1.5">
                <Label htmlFor={`${id}-limit`} className="text-xs">
                  Show at most
                </Label>
                <Input
                  id={`${id}-limit`}
                  type="number"
                  min={1}
                  max={50}
                  value={value.limit}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      limit: Math.min(50, Math.max(1, Number(e.target.value) || 1)),
                    })
                  }
                  className="w-24"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                <Badge variant="secondary" className="mr-1">
                  {Math.min(matching.length, value.limit)}
                </Badge>
                {matching.length === 0
                  ? 'No entries match; the section keeps its own items until some do.'
                  : `${col?.label.toLowerCase()} will appear here. Edit them once in the Content tab and every page updates.`}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
