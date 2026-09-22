import { Link } from '@tanstack/react-router';
import { FileText, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEditor } from './EditorProvider';
import { NewPageDialog } from './NewPageDialog';

export function PagesPanel() {
  const { pages, state, siteId, canEdit } = useEditor();
  const [open, setOpen] = useState(false);
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
          <li key={p.id}>
            <Link
              to="/sites/$siteId/pages/$pageId"
              params={{ siteId, pageId: p.id }}
              className={cn(
                'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted',
                p.id === state.document.id && 'bg-muted font-medium',
              )}
            >
              <FileText className="size-4 text-muted-foreground" />
              <span className="truncate">{p.title}</span>
              <span className="ml-auto truncate text-xs text-muted-foreground">{p.slug}</span>
            </Link>
          </li>
        ))}
      </ul>
      <NewPageDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
