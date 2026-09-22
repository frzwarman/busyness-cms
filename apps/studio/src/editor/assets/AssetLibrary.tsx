import {
  type Asset,
  AssetInUseError,
  type AssetUsage,
  deleteAsset,
  listAssetUsages,
  updateAsset,
} from '@siteos/db';
import type { ImageRef } from '@siteos/schemas';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Check,
  FileText,
  LayoutGrid,
  List,
  Loader2,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  ACCEPTED_TYPES,
  assetUrl,
  deleteAssetObjects,
  type UploadStage,
  uploadAsset,
} from '@/lib/assets/upload';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useEditor } from '../EditorProvider';
import { assetsQuery, formatBytes, usageCountsQuery } from './asset-queries';

type UploadJob = {
  id: string;
  name: string;
  stage: UploadStage | 'error' | 'duplicate';
  detail?: string;
};

/** Build the ImageRef a section stores when an asset is chosen: mid-size src, srcset sources, alt, focal point. */
export function imageRefFromAsset(a: Asset): ImageRef {
  const byName = Object.fromEntries(a.variants.map((v) => [v.name, v]));
  const primary = byName['960'] ?? byName['1920'] ?? byName.original;
  const sources = a.variants
    .filter((v) => v.name !== 'original' && v.width)
    .map((v) => ({ width: v.width as number, src: assetUrl(v.key) }));
  if (byName.original?.width)
    sources.push({ width: byName.original.width, src: assetUrl(byName.original.key) });
  return {
    assetId: a.id,
    src: primary ? assetUrl(primary.key) : '',
    alt: a.alt,
    decorative: a.decorative,
    width: primary?.width ?? a.width ?? undefined,
    height: primary?.height ?? a.height ?? undefined,
    focalX: a.focalX,
    focalY: a.focalY,
    sources: sources.length ? sources.sort((x, y) => x.width - y.width) : undefined,
  };
}

const stageLabels: Record<UploadStage, string> = {
  hashing: 'Checking…',
  resizing: 'Resizing…',
  authorizing: 'Preparing…',
  uploading: 'Uploading…',
  registering: 'Saving…',
  done: 'Done',
};

/**
 * Asset browser + uploader + details. `onPick` turns it into a picker (images only) for the image control.
 * Deletion is protected: assets in use show where, and only admins may force it.
 */
export function AssetLibrary({
  onPick,
  compact = false,
}: {
  onPick?: (a: Asset) => void;
  compact?: boolean;
}) {
  const { siteId, canEdit } = useEditor();
  const qc = useQueryClient();
  const { data: assets, isLoading, error } = useQuery(assetsQuery(siteId));
  const { data: usageCounts } = useQuery(usageCountsQuery(siteId));
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'all' | 'image' | 'document'>(onPick ? 'image' : 'all');
  const [sort, setSort] = useState<'newest' | 'name' | 'size'>('newest');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selected, setSelected] = useState<string | null>(null);
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (assets ?? [])
      .filter((a) =>
        type === 'all'
          ? true
          : type === 'image'
            ? a.mimeType.startsWith('image/')
            : !a.mimeType.startsWith('image/'),
      )
      .filter(
        (a) =>
          !q || [a.filename, a.alt, a.caption, ...a.tags].some((s) => s.toLowerCase().includes(q)),
      )
      .sort((a, b) =>
        sort === 'name'
          ? a.filename.localeCompare(b.filename)
          : sort === 'size'
            ? b.size - a.size
            : b.createdAt.localeCompare(a.createdAt),
      );
  }, [assets, query, type, sort]);
  const current = assets?.find((a) => a.id === selected) ?? null;

  const upload = async (files: FileList | File[]) => {
    for (const file of Array.from(files)) {
      const id = crypto.randomUUID();
      setJobs((j) => [...j, { id, name: file.name, stage: 'hashing' }]);
      try {
        const result = await uploadAsset(file, siteId, (stage, detail) =>
          setJobs((j) => j.map((x) => (x.id === id ? { ...x, stage, detail } : x))),
        );
        await qc.invalidateQueries({ queryKey: ['assets', siteId] });
        if (result.kind === 'duplicate')
          setJobs((j) =>
            j.map((x) => (x.id === id ? { ...x, stage: 'duplicate', detail: result.filename } : x)),
          );
        else setJobs((j) => j.filter((x) => x.id !== id));
        setSelected(result.assetId);
      } catch (e) {
        setJobs((j) =>
          j.map((x) =>
            x.id === id
              ? { ...x, stage: 'error', detail: e instanceof Error ? e.message : 'Upload failed' }
              : x,
          ),
        );
      }
    }
  };

  return (
    <div className={cn('flex h-full min-h-0 flex-col', !compact && 'md:flex-row')}>
      <section
        className={cn('flex min-h-0 flex-1 flex-col', dragging && 'ring-2 ring-primary ring-inset')}
        aria-label="Asset browser"
        onDragOver={(e) => {
          if (canEdit) {
            e.preventDefault();
            setDragging(true);
          }
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (canEdit && e.dataTransfer.files.length) void upload(e.dataTransfer.files);
        }}
      >
        <div className="flex flex-wrap items-center gap-2 border-b p-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, alt text or tag"
              aria-label="Search assets"
              className="h-8 pl-8"
            />
          </div>
          {!onPick && (
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger className="h-8 w-28" aria-label="File type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All files</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
            <SelectTrigger className="h-8 w-28" aria-label="Sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="size">Largest</SelectItem>
            </SelectContent>
          </Select>
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => v && setView(v as typeof view)}
            variant="outline"
            size="sm"
            aria-label="View"
          >
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <LayoutGrid />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <List />
            </ToggleGroupItem>
          </ToggleGroup>
          {canEdit && (
            <>
              <input
                ref={fileInput}
                type="file"
                multiple
                accept={ACCEPTED_TYPES.join(',')}
                className="sr-only"
                aria-label="Upload files"
                onChange={(e) => {
                  if (e.target.files?.length) void upload(e.target.files);
                  e.target.value = '';
                }}
              />
              <Button size="sm" onClick={() => fileInput.current?.click()}>
                <Upload data-icon="inline-start" /> Upload
              </Button>
            </>
          )}
        </div>

        {jobs.length > 0 && (
          <ul
            className="grid max-h-32 gap-1 overflow-auto border-b bg-muted/30 p-2 text-xs"
            aria-live="polite"
          >
            {jobs.map((j) => (
              <li key={j.id} className="flex items-center gap-2">
                {j.stage === 'error' ? (
                  <AlertTriangle className="size-3.5 text-destructive" />
                ) : j.stage === 'duplicate' ? (
                  <Check className="size-3.5 text-amber-600" />
                ) : (
                  <Loader2 className="size-3.5 animate-spin" />
                )}
                <span className="truncate font-medium">{j.name}</span>
                <span
                  className={cn('text-muted-foreground', j.stage === 'error' && 'text-destructive')}
                >
                  {j.stage === 'error'
                    ? j.detail
                    : j.stage === 'duplicate'
                      ? `Already in your library as “${j.detail}” — using the existing file.`
                      : `${stageLabels[j.stage]}${j.detail && j.stage === 'uploading' ? ` ${j.detail}` : ''}`}
                </span>
                {(j.stage === 'error' || j.stage === 'duplicate') && (
                  <Button
                    size="xs"
                    variant="ghost"
                    className="ml-auto"
                    onClick={() => setJobs((x) => x.filter((y) => y.id !== j.id))}
                  >
                    Dismiss
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="min-h-0 flex-1 overflow-auto p-3">
          {isLoading && <p className="text-sm text-muted-foreground">Loading assets…</p>}
          {error && (
            <p className="text-sm text-destructive">Could not load assets: {error.message}</p>
          )}
          {assets && assets.length === 0 && (
            <div className="grid place-items-center gap-3 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              <Upload className="size-6" />
              <p>
                Upload your logo, photos, menu PDFs and brand assets here. Images are resized in
                your browser before upload.
              </p>
              {canEdit && (
                <Button size="sm" onClick={() => fileInput.current?.click()}>
                  Upload files
                </Button>
              )}
            </div>
          )}
          {assets && assets.length > 0 && list.length === 0 && (
            <p className="text-sm text-muted-foreground">No assets match “{query}”.</p>
          )}
          {list.length > 0 && (
            <ul
              className={cn(
                view === 'grid'
                  ? cn('grid gap-2', compact ? 'grid-cols-2' : 'grid-cols-3 lg:grid-cols-4')
                  : 'grid gap-1',
              )}
              aria-label="Assets"
            >
              {list.map((a) => {
                const thumb =
                  a.variants.find((v) => v.name === '320') ??
                  a.variants.find((v) => v.name === 'original');
                const isImg = a.mimeType.startsWith('image/');
                const uses = usageCounts?.[a.id] ?? 0;
                return (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(a.id)}
                      onDoubleClick={() => onPick && isImg && onPick(a)}
                      aria-pressed={selected === a.id}
                      className={cn(
                        'flex w-full gap-2 rounded-md border p-1.5 text-left hover:bg-muted',
                        view === 'grid' && 'flex-col',
                        selected === a.id && 'border-foreground ring-1 ring-foreground',
                      )}
                    >
                      <span
                        className={cn(
                          'grid shrink-0 place-items-center overflow-hidden rounded bg-muted',
                          view === 'grid' ? 'aspect-square w-full' : 'size-10',
                        )}
                      >
                        {isImg && thumb ? (
                          <img
                            src={assetUrl(thumb.key)}
                            alt=""
                            className="h-full w-full object-cover"
                            style={{ objectPosition: `${a.focalX * 100}% ${a.focalY * 100}%` }}
                            loading="lazy"
                          />
                        ) : (
                          <FileText className="size-5 text-muted-foreground" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-medium">{a.filename}</span>
                        <span className="flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
                          {a.width && a.height ? `${a.width}×${a.height} · ` : ''}
                          {formatBytes(a.size)}
                          {uses > 0 && (
                            <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                              Used in {uses}
                            </Badge>
                          )}
                          {isImg && !a.decorative && !a.alt && (
                            <AlertTriangle
                              className="size-3 text-amber-500"
                              aria-label="Missing alt text"
                            />
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {current && (
        <AssetDetails
          key={current.id}
          asset={current}
          usageCount={usageCounts?.[current.id] ?? 0}
          onPick={onPick}
          compact={compact}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function AssetDetails({
  asset,
  usageCount,
  onPick,
  compact,
  onClose,
}: {
  asset: Asset;
  usageCount: number;
  onPick?: (a: Asset) => void;
  compact: boolean;
  onClose: () => void;
}) {
  const { siteId, canEdit } = useEditor();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    alt: asset.alt,
    decorative: asset.decorative,
    caption: asset.caption,
    tags: asset.tags.join(', '),
    focalX: asset.focalX,
    focalY: asset.focalY,
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [usages, setUsages] = useState<AssetUsage[] | null>(null);
  const [deleteState, setDeleteState] = useState<{
    error?: string;
    busy?: boolean;
    confirm?: boolean;
  }>({});
  const isImg = asset.mimeType.startsWith('image/');
  const preview =
    asset.variants.find((v) => v.name === '960') ??
    asset.variants.find((v) => v.name === 'original');
  const dirty =
    form.alt !== asset.alt ||
    form.decorative !== asset.decorative ||
    form.caption !== asset.caption ||
    form.tags !== asset.tags.join(', ') ||
    form.focalX !== asset.focalX ||
    form.focalY !== asset.focalY;

  useEffect(() => {
    if (!dirty) return;
    setStatus('saving');
    const t = setTimeout(() => {
      updateAsset(supabase, {
        id: asset.id,
        alt: form.alt,
        decorative: form.decorative,
        caption: form.caption,
        tags: form.tags
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        focalX: form.focalX,
        focalY: form.focalY,
      })
        .then(() => {
          setStatus('saved');
          void qc.invalidateQueries({ queryKey: ['assets', siteId] });
        })
        .catch(() => setStatus('error'));
    }, 700);
    return () => clearTimeout(t);
  }, [form, dirty, asset.id, siteId, qc]);

  const showUsages = async () => setUsages(await listAssetUsages(supabase, asset.id));

  const remove = async (force = false) => {
    setDeleteState({ busy: true });
    try {
      const keys = await deleteAsset(supabase, asset.id, force);
      await deleteAssetObjects(siteId, keys);
      await qc.invalidateQueries({ queryKey: ['assets', siteId] });
      await qc.invalidateQueries({ queryKey: ['asset-usages', siteId] });
      onClose();
    } catch (e) {
      if (e instanceof AssetInUseError) {
        await showUsages();
        setDeleteState({ error: e.message });
      } else setDeleteState({ error: e instanceof Error ? e.message : 'Delete failed' });
    }
  };

  const setFocal = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setForm((f) => ({
      ...f,
      focalX: Math.round(((e.clientX - r.left) / r.width) * 100) / 100,
      focalY: Math.round(((e.clientY - r.top) / r.height) * 100) / 100,
    }));
  };

  return (
    <aside
      className={cn(
        'flex min-h-0 shrink-0 flex-col overflow-auto border-t bg-muted/20 p-3 text-sm',
        compact && 'max-h-[55%]',
        !compact && 'md:w-80 md:border-t-0 md:border-l',
      )}
      aria-label="Asset details"
    >
      {isImg && preview ? (
        <button
          type="button"
          onClick={canEdit ? setFocal : undefined}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-muted"
          aria-label={`Focal point at ${Math.round(form.focalX * 100)}% across, ${Math.round(form.focalY * 100)}% down. Click to move it.`}
        >
          <img
            src={assetUrl(preview.key)}
            alt=""
            className="h-full w-full object-cover"
            style={{ objectPosition: `${form.focalX * 100}% ${form.focalY * 100}%` }}
          />
          <span
            className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary/80 shadow"
            style={{ left: `${form.focalX * 100}%`, top: `${form.focalY * 100}%` }}
          />
        </button>
      ) : (
        <div className="grid aspect-[4/3] place-items-center rounded-md bg-muted">
          <FileText className="size-8 text-muted-foreground" />
        </div>
      )}
      <p className="mt-2 truncate font-medium" title={asset.filename}>
        {asset.filename}
      </p>
      <p className="text-xs text-muted-foreground">
        {asset.mimeType} · {formatBytes(asset.size)}
        {asset.width ? ` · ${asset.width}×${asset.height}px` : ''} · {asset.variants.length} file
        {asset.variants.length === 1 ? '' : 's'} stored
      </p>
      {onPick && isImg && (
        <Button className="mt-3" onClick={() => onPick(asset)}>
          Use this image
        </Button>
      )}

      {isImg && (
        <div className="mt-3 grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="asset-alt" className="text-xs">
              Alt text
            </Label>
            <Input
              id="asset-alt"
              value={form.alt}
              disabled={!canEdit || form.decorative}
              onChange={(e) => setForm((f) => ({ ...f, alt: e.target.value }))}
              placeholder="Describe what the image shows"
            />
            {!form.decorative && !form.alt && (
              <p className="flex items-center gap-1 text-[11px] text-amber-600">
                <AlertTriangle className="size-3" /> Missing alt text. Sections using this image
                inherit it.
              </p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="asset-decorative" className="text-xs font-normal">
              Decorative (no alt text needed)
            </Label>
            <Switch
              id="asset-decorative"
              checked={form.decorative}
              disabled={!canEdit}
              onCheckedChange={(v) => setForm((f) => ({ ...f, decorative: v }))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="asset-caption" className="text-xs">
              Caption
            </Label>
            <Input
              id="asset-caption"
              value={form.caption}
              disabled={!canEdit}
              onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
            />
          </div>
        </div>
      )}
      <div className="mt-3 grid gap-1.5">
        <Label htmlFor="asset-tags" className="text-xs">
          Tags (comma separated)
        </Label>
        <Input
          id="asset-tags"
          value={form.tags}
          disabled={!canEdit}
          onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
          placeholder="hero, menu, team"
        />
      </div>
      <p className="mt-1 h-4 text-[11px] text-muted-foreground" aria-live="polite">
        {status === 'saving'
          ? 'Saving…'
          : status === 'saved'
            ? 'Saved'
            : status === 'error'
              ? 'Failed to save'
              : ''}
      </p>

      <div className="mt-3 border-t pt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">Where is this used?</span>
          <Button size="xs" variant="ghost" onClick={showUsages}>
            {usages
              ? 'Refresh'
              : usageCount > 0
                ? `Used in ${usageCount} place${usageCount === 1 ? '' : 's'}`
                : 'Not used yet'}
          </Button>
        </div>
        {usages && (
          <ul className="mt-1 grid gap-0.5 text-xs text-muted-foreground">
            {usages.length === 0 && <li>Not referenced by any draft or published page.</li>}
            {usages.map((u) => (
              <li key={`${u.pageId}:${u.sectionId}:${u.kind}`}>
                {u.pageTitle} <span className="opacity-70">{u.pageSlug}</span> · section{' '}
                {u.sectionId.slice(4, 10)} · {u.kind}
              </li>
            ))}
          </ul>
        )}
      </div>

      {canEdit && (
        <div className="mt-3 border-t pt-3">
          {deleteState.error && (
            <p role="alert" className="mb-2 text-xs text-destructive">
              {deleteState.error}
            </p>
          )}
          {!deleteState.confirm ? (
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              disabled={deleteState.busy}
              onClick={() => setDeleteState({ confirm: true })}
            >
              <Trash2 data-icon="inline-start" /> Delete asset
            </Button>
          ) : (
            <div className="grid gap-2 rounded-md border border-destructive/40 p-2">
              <p className="text-xs">
                {usageCount > 0
                  ? `This asset is used in ${usageCount} place${usageCount === 1 ? '' : 's'}. Deleting will break those images unless you replace them first.`
                  : 'Delete this file permanently? This cannot be undone.'}
              </p>
              <div className="flex gap-2">
                <Button size="xs" variant="outline" onClick={() => setDeleteState({})}>
                  Cancel
                </Button>
                {usageCount === 0 && (
                  <Button
                    size="xs"
                    variant="destructive"
                    disabled={deleteState.busy}
                    onClick={() => void remove(false)}
                  >
                    {deleteState.busy && <Loader2 className="animate-spin" />} Delete
                  </Button>
                )}
                {usageCount > 0 && (
                  <Button
                    size="xs"
                    variant="destructive"
                    disabled={deleteState.busy}
                    onClick={() => void remove(true)}
                  >
                    {deleteState.busy && <Loader2 className="animate-spin" />} Force delete (admins)
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
