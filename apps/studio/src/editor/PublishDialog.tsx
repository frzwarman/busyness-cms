import { publishPage } from '@siteos/db';
import { describeChanges, summarizeChange } from '@siteos/editor-core';
import { registry } from '@siteos/sections';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Loader2, Rocket } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { purgePublished } from '@/lib/purge';
import { supabase } from '@/lib/supabase';
import { useResolvedDocument } from './content/content-queries';
import { useEditor } from './EditorProvider';
import { publishStateQuery } from './publish-queries';

/**
 * Publish = validate every section with the registry, show what changes against the live version,
 * then snapshot the draft into an immutable version. Never reports success before the server confirms.
 */
export function PublishDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { state, saveStatus, saveNow, siteId, siteSlug } = useEditor();
  const { resolved, ready } = useResolvedDocument();
  const pageId = state.document.id;
  const qc = useQueryClient();
  const { data: live } = useQuery(publishStateQuery(pageId));
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);

  const { issues } = registry.normalizeDocument(resolved);
  const diff = live?.publishedDocument
    ? describeChanges(live.publishedDocument, resolved, registry)
    : null;
  const blocked =
    !ready ||
    issues.length > 0 ||
    state.dirty ||
    saveStatus === 'saving' ||
    saveStatus === 'conflict';

  const publish = async () => {
    setBusy(true);
    setError(null);
    try {
      const v = await publishPage(supabase, pageId, note.trim() || undefined, resolved);
      await qc.invalidateQueries({ queryKey: ['publish', pageId] });
      await qc.invalidateQueries({ queryKey: ['versions', pageId] });
      setDone(v.number);
      void purgePublished(siteId, siteSlug, state.document.slug); // best effort; the short TTL covers the rest
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Publishing failed.');
    } finally {
      setBusy(false);
    }
  };

  const close = (o: boolean) => {
    if (!o) {
      setDone(null);
      setError(null);
      setNote('');
    }
    onOpenChange(o);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {done ? `Published v${done}` : `Publish “${state.document.title}”`}
          </DialogTitle>
          <DialogDescription>
            {done
              ? 'The live site now serves this version. Earlier versions stay in history.'
              : 'Visitors keep seeing the current live version until you publish.'}
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <p className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="size-4 text-emerald-600" /> Version {done} is live.
          </p>
        ) : (
          <div className="grid gap-4 text-sm">
            {issues.length > 0 && (
              <div
                role="alert"
                className="rounded-md border border-destructive/40 bg-destructive/5 p-3"
              >
                <p className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="size-4 text-destructive" /> This page can't be published
                  because {issues.length} section{issues.length > 1 ? 's contain' : ' contains'}{' '}
                  invalid content.
                </p>
                <ul className="mt-2 list-disc pl-5 text-muted-foreground">
                  {issues.map((i) => (
                    <li key={i.sectionId}>
                      {registry.get(i.type)?.title ?? i.type}: {i.errors.join('; ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(state.dirty || saveStatus === 'saving') && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Saving your latest changes first…{' '}
                <Button size="xs" variant="outline" onClick={saveNow}>
                  Save now
                </Button>
              </p>
            )}
            {saveStatus === 'conflict' && (
              <p className="text-destructive">
                This page was changed elsewhere. Reload before publishing.
              </p>
            )}
            <div>
              <h3 className="mb-1 font-medium">
                {live?.publishedDocument
                  ? `Changes since v${live.publishedNumber}`
                  : 'First publish'}
              </h3>
              {diff ? (
                diff.page.length + diff.sections.length === 0 ? (
                  <p className="text-muted-foreground">
                    No content changes. Publishing will still refresh the live theme.
                  </p>
                ) : (
                  <ul className="grid gap-1 text-muted-foreground">
                    {diff.page.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                    {diff.sections.map((c) => (
                      <li key={`${c.sectionId}:${c.kind}`}>
                        <span className="text-foreground">{c.title}</span> — {summarizeChange(c)}
                      </li>
                    ))}
                  </ul>
                )
              ) : (
                <p className="text-muted-foreground">
                  {state.document.sections.length} section
                  {state.document.sections.length === 1 ? '' : 's'} will go live.
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="publish-note" className="text-xs">
                Note (optional)
              </Label>
              <Input
                id="publish-note"
                value={note}
                maxLength={120}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. New opening hours"
              />
            </div>
            {error && (
              <p role="alert" className="text-destructive">
                {error}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          {done ? (
            <Button onClick={() => close(false)}>Done</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => close(false)}>
                Cancel
              </Button>
              <Button onClick={publish} disabled={blocked || busy}>
                {busy ? <Loader2 className="animate-spin" /> : <Rocket />} Publish
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
