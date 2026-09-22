import { deletePage, pageRefs } from '@siteos/db';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useEditor } from './EditorProvider';
import { NewPageDialog } from './NewPageDialog';

export function PagesPanel() {
  const { pages, state, siteId, canEdit } = useEditor();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const remove = async (id: string, title: string) => {
    setBusy(id);
    try {
      const refs = await pageRefs(supabase, id);
      const linked = [...new Set(refs.map((r) => r.pageTitle))];
      const warning = linked.length
        ? `\n\n${linked.length} other page${linked.length === 1 ? '' : 's'} link${linked.length === 1 ? 's' : ''} to it (${linked.join(', ')}). Those links stop working until you change them.`
        : '';
      if (
        !window.confirm(
          `Delete “${title}” and its version history? If it is published, visitors will get a 404; add a redirect in Site settings if needed.${warning}`,
        )
      )
        return;
      await deletePage(supabase, id);
      await qc.invalidateQueries({ queryKey: ['pages', siteId] });
      if (id === state.document.id) {
        const next = pages.find((p) => p.id !== id);
        if (next)
          void navigate({
            to: '/sites/$siteId/pages/$pageId',
            params: { siteId, pageId: next.id },
          });
        else void navigate({ to: '/sites/$siteId', params: { siteId } });
      }
    } finally {
      setBusy(null);
    }
  };
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-3 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Pages
        </h2>
        <Button size="sm" variant="outline" disabled={!canEdit} onClick={() => setOpen(true)}>
          <Plus data-icon="inline-start" /> New page
        </Button>
      </div>
      <ul className="space-y-0.5 px-2">
        {pages.map((p) => (
          <li key={p.id} className="group flex items-center">
            <Link
              to="/sites/$siteId/pages/$pageId"
              params={{ siteId, pageId: p.id }}
              className={cn(
                'flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted',
                p.id === state.document.id && 'bg-muted font-medium',
              )}
            >
              <FileText className="size-4 text-muted-foreground" />
              <span className="truncate">{p.title}</span>
              <span className="ml-auto truncate text-xs text-muted-foreground">{p.slug}</span>
            </Link>
            {canEdit && pages.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive focus-visible:opacity-100"
                aria-label={`Delete page ${p.title}`}
                disabled={busy === p.id}
                onClick={() => void remove(p.id, p.title)}
              >
                <Trash2 />
              </Button>
            )}
          </li>
        ))}
      </ul>
      <NewPageDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
