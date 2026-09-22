import {
  createEntry,
  deleteEntry,
  deleteGlobal,
  entryRefs,
  globalRefs,
  type Ref,
  updateEntry,
} from '@siteos/db';
import { getPath, setPath } from '@siteos/editor-core';
import { collections, registry } from '@siteos/sections';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, Globe, Loader2, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useEditor } from '../EditorProvider';
import { isCompositeControl, renderControl } from '../Inspector';
import { entriesQuery, globalsQuery } from './content-queries';

/** Content library (reusable entries) and global sections, managed from the left panel. */
export function ContentPanel() {
  const { siteId, canEdit } = useEditor();
  const qc = useQueryClient();
  const [collectionId, setCollectionId] = useState(collections[0]?.id ?? 'testimonials');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [refs, setRefs] = useState<Record<string, Ref[] | 'loading'>>({});
  const [error, setError] = useState<string | null>(null);
  const { data: entries } = useQuery(entriesQuery(siteId));
  const { data: globals } = useQuery(globalsQuery(siteId));
  const col = (collections.find((c) => c.id === collectionId) ??
    collections[0]) as (typeof collections)[number];
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (entries ?? [])
      .filter((e) => e.collection === col.id)
      .filter(
        (e) =>
          !q ||
          JSON.stringify(e.data).toLowerCase().includes(q) ||
          e.tags.some((t) => t.includes(q)),
      );
  }, [entries, col.id, query]);
  const invalidate = () => qc.invalidateQueries({ queryKey: ['content', siteId] });

  const add = async () => {
    setError(null);
    try {
      const id = await createEntry(supabase, siteId, col.id, col.newItem());
      await invalidate();
      setOpen(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add entry');
    }
  };
  const remove = async (id: string) => {
    setRefs((r) => ({ ...r, [id]: 'loading' }));
    const used = await entryRefs(supabase, id);
    if (
      used.length &&
      !window.confirm(
        `This entry is picked by ${used.length} section${used.length === 1 ? '' : 's'} (${used.map((u) => u.pageTitle).join(', ')}). Sections using it by tag or “all” will simply stop showing it. Delete anyway?`,
      )
    ) {
      setRefs((r) => ({ ...r, [id]: used }));
      return;
    }
    await deleteEntry(supabase, id);
    await invalidate();
    setOpen(null);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Content library
        </h2>
      </div>
      <div className="grid gap-2 px-3">
        <Select value={col.id} onValueChange={setCollectionId}>
          <SelectTrigger aria-label="Collection" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {collections.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}{' '}
                <span className="text-muted-foreground">
                  ({(entries ?? []).filter((e) => e.collection === c.id).length})
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[11px] text-muted-foreground">
          {col.description} Sections can show these instead of their own items.
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${col.label.toLowerCase()}`}
              aria-label={`Search ${col.label}`}
              className="h-8 pl-8"
            />
          </div>
          {canEdit && (
            <Button size="sm" onClick={add}>
              <Plus data-icon="inline-start" /> Add
            </Button>
          )}
        </div>
        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
      <ol className="mt-2 grid gap-1 px-3" aria-label={col.label}>
        {list.length === 0 && (
          <li className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
            No {col.label.toLowerCase()} yet. Add one and reuse it on any page.
          </li>
        )}
        {list.map((e) => (
          <EntryRow
            key={e.id}
            entry={e}
            col={col}
            open={open === e.id}
            onToggle={() => setOpen(open === e.id ? null : e.id)}
            onDelete={() => remove(e.id)}
            refs={refs[e.id]}
            canEdit={canEdit}
            onSaved={invalidate}
          />
        ))}
      </ol>

      <div className="mt-4 border-t px-3 py-2">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Global sections
        </h2>
        <p className="mb-2 text-[11px] text-muted-foreground">
          Edit once, update everywhere on next publish. Create one from any section’s menu (“Make
          global”), then insert it from the section picker.
        </p>
        <ul className="grid gap-1">
          {(globals ?? []).length === 0 && (
            <li className="text-xs text-muted-foreground">No global sections yet.</li>
          )}
          {(globals ?? []).map((g) => (
            <GlobalRowItem
              key={g.id}
              id={g.id}
              name={g.name}
              type={g.section.type}
              canEdit={canEdit}
              onDeleted={() => qc.invalidateQueries({ queryKey: ['globals', siteId] })}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

function EntryRow({
  entry,
  col,
  open,
  onToggle,
  onDelete,
  refs,
  canEdit,
  onSaved,
}: {
  entry: { id: string; data: Record<string, unknown>; tags: string[] };
  col: (typeof collections)[number];
  open: boolean;
  onToggle: () => void;
  onDelete: () => void;
  refs?: Ref[] | 'loading';
  canEdit: boolean;
  onSaved: () => Promise<unknown>;
}) {
  const [data, setData] = useState(entry.data);
  const [tags, setTags] = useState(entry.tags.join(', '));
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const dirty =
    JSON.stringify(data) !== JSON.stringify(entry.data) || tags !== entry.tags.join(', ');
  useEffect(() => {
    if (!dirty || !canEdit) return;
    const valid = col.schema.safeParse(data).success;
    if (!valid) return; // wait until required fields are filled
    setStatus('saving');
    const t = setTimeout(() => {
      updateEntry(supabase, entry.id, {
        data,
        tags: tags
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      })
        .then(() => onSaved())
        .then(() => setStatus('saved'))
        .catch(() => setStatus('error'));
    }, 700);
    return () => clearTimeout(t);
  }, [data, tags, dirty, canEdit, col.schema, entry.id, onSaved]);
  const title = String(data[col.titlePath] || `Untitled ${col.singular.toLowerCase()}`);
  const invalid = !col.schema.safeParse(data).success;
  return (
    <li className="rounded-md border">
      <div className="flex items-center gap-1 pr-1">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-1.5 px-2 py-1.5 text-left text-sm"
        >
          {open ? (
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
          )}
          <span className="truncate">{title}</span>
          {entry.tags.map((t) => (
            <Badge key={t} variant="secondary" className="h-4 px-1 text-[10px]">
              {t}
            </Badge>
          ))}
        </button>
        {canEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-destructive"
            aria-label={`Delete ${title}`}
            disabled={refs === 'loading'}
            onClick={onDelete}
          >
            {refs === 'loading' ? <Loader2 className="animate-spin" /> : <Trash2 />}
          </Button>
        )}
      </div>
      {open && (
        <div className="grid gap-3 border-t bg-muted/30 p-2.5">
          {col.fields.map((f) => (
            <div key={f.path} className="grid gap-1.5">
              <Label
                htmlFor={
                  isCompositeControl(f.control)
                    ? undefined
                    : `entry-${entry.id}-${f.path.replace(/\./g, '-')}`
                }
                className="text-xs"
              >
                {f.label}
              </Label>
              {renderControl(
                f,
                getPath(data, f.path),
                (v) => setData((d) => setPath(d, f.path, v)),
                `entry-${entry.id}-${f.path.replace(/\./g, '-')}`,
              )}
            </div>
          ))}
          <div className="grid gap-1.5">
            <Label htmlFor={`entry-${entry.id}-tags`} className="text-xs">
              Tags (comma separated)
            </Label>
            <Input
              id={`entry-${entry.id}-tags`}
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="home, featured"
            />
          </div>
          <p
            className={cn(
              'h-4 text-[11px] text-muted-foreground',
              status === 'error' && 'text-destructive',
            )}
            aria-live="polite"
          >
            {invalid
              ? 'Fill in the required fields to save.'
              : status === 'saving'
                ? 'Saving…'
                : status === 'saved'
                  ? 'Saved'
                  : status === 'error'
                    ? 'Failed to save'
                    : ''}
          </p>
        </div>
      )}
    </li>
  );
}

function GlobalRowItem({
  id,
  name,
  type,
  canEdit,
  onDeleted,
}: {
  id: string;
  name: string;
  type: string;
  canEdit: boolean;
  onDeleted: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const remove = async () => {
    setBusy(true);
    const used = await globalRefs(supabase, id);
    if (used.length) {
      window.alert(
        `“${name}” is used on ${used.length} page${used.length === 1 ? '' : 's'} (${[...new Set(used.map((u) => u.pageTitle))].join(', ')}). Detach or remove it there first.`,
      );
      setBusy(false);
      return;
    }
    if (window.confirm(`Delete the global section “${name}”?`)) await deleteGlobal(supabase, id);
    setBusy(false);
    onDeleted();
  };
  return (
    <li className="flex items-center gap-2 rounded-md border px-2 py-1.5 text-sm">
      <Globe className="size-4 text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate">
        {name}{' '}
        <span className="text-xs text-muted-foreground">· {registry.get(type)?.title ?? type}</span>
      </span>
      {canEdit && (
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-destructive"
          aria-label={`Delete global ${name}`}
          disabled={busy}
          onClick={remove}
        >
          {busy ? <Loader2 className="animate-spin" /> : <Trash2 />}
        </Button>
      )}
    </li>
  );
}
