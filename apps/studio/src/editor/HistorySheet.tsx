import { type PageVersion, restoreVersion } from '@siteos/db';
import { describeChanges, summarizeChange } from '@siteos/editor-core';
import { registry } from '@siteos/sections';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { History, Loader2, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { supabase } from '@/lib/supabase';
import { useEditor } from './EditorProvider';
import { publishStateQuery, relativeTime, versionsQuery } from './publish-queries';

/** Version history: inspect what changed between versions and restore any of them into the draft. */
export function HistorySheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { state, canEdit } = useEditor();
  const pageId = state.document.id;
  const { data: versions, isLoading } = useQuery({ ...versionsQuery(pageId), enabled: open });
  const { data: live } = useQuery(publishStateQuery(pageId));
  const qc = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const restore = async (v: PageVersion) => {
    if (
      !window.confirm(
        `Restore v${v.number} into your draft? Your current draft changes are kept in history only if they were published.`,
      )
    )
      return;
    setBusyId(v.id);
    setError(null);
    try {
      await restoreVersion(supabase, v.id);
      await qc.invalidateQueries({ queryKey: ['draft', pageId] });
      onOpenChange(false);
      // The editor reloads the draft (new revision) via the route query.
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Restore failed.');
      setBusyId(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[26rem] sm:max-w-[26rem]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="size-4" /> Version history
          </SheetTitle>
          <SheetDescription>
            Every publish creates an immutable version. Restoring copies a version into your draft;
            it does not change what is live until you publish again.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-auto px-4 pb-4">
          {isLoading && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading…
            </p>
          )}
          {versions && versions.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nothing published yet. Your draft becomes v1 when you publish.
            </p>
          )}
          {error && (
            <p role="alert" className="mb-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <ol className="grid gap-2">
            <li className="rounded-md border border-dashed p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">Draft</span>
                <Badge variant="outline">editing</Badge>
              </div>
              {live?.publishedDocument && (
                <Diff
                  prev={live.publishedDocument}
                  next={state.document}
                  emptyText="Same as the live version."
                />
              )}
            </li>
            {versions?.map((v, i) => {
              const prev = versions[i + 1];
              const isLive = v.id === live?.publishedVersionId;
              return (
                <li key={v.id} className="rounded-md border p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">
                      v{v.number}
                      {v.note ? (
                        <span className="font-normal text-muted-foreground"> · {v.note}</span>
                      ) : null}
                    </span>
                    <span className="flex items-center gap-2">
                      {isLive && <Badge>Live</Badge>}
                      <span className="text-xs text-muted-foreground">
                        {relativeTime(v.createdAt)}
                      </span>
                    </span>
                  </div>
                  {prev ? (
                    <Diff
                      prev={prev.document}
                      next={v.document}
                      emptyText="No content changes from the previous version."
                    />
                  ) : (
                    <p className="mt-1 text-xs text-muted-foreground">First version.</p>
                  )}
                  {canEdit && (
                    <Button
                      size="xs"
                      variant="outline"
                      className="mt-2"
                      disabled={busyId !== null}
                      onClick={() => void restore(v)}
                    >
                      {busyId === v.id ? <Loader2 className="animate-spin" /> : <RotateCcw />}{' '}
                      Restore to draft
                    </Button>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Diff({
  prev,
  next,
  emptyText,
}: {
  prev: PageVersion['document'];
  next: PageVersion['document'];
  emptyText: string;
}) {
  const d = describeChanges(prev, next, registry);
  if (d.page.length + d.sections.length === 0)
    return <p className="mt-1 text-xs text-muted-foreground">{emptyText}</p>;
  return (
    <ul className="mt-1 grid gap-0.5 text-xs text-muted-foreground">
      {d.page.map((p) => (
        <li key={p}>{p}</li>
      ))}
      {d.sections.map((c) => (
        <li key={`${c.sectionId}:${c.kind}`}>
          <span className="text-foreground">{c.title}</span> — {summarizeChange(c)}
        </li>
      ))}
    </ul>
  );
}
