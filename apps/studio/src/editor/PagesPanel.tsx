import { slugSchema } from '@siteos/schemas';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { FileText, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createPageDraft } from '@/lib/draft-store';
import { cn } from '@/lib/utils';
import { useEditor } from './EditorProvider';

export function PagesPanel() {
  const { pages, state } = useEditor();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const slug = `/${title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`;

  const create = async () => {
    const check = slugSchema.safeParse(slug);
    if (!title.trim() || !check.success)
      return setError('Give the page a name using letters or numbers.');
    try {
      const page = await createPageDraft(title.trim(), slug);
      await qc.invalidateQueries({ queryKey: ['site'] });
      setCreating(false);
      setTitle('');
      setError(null);
      void navigate({ to: '/pages/$pageId', params: { pageId: page.id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create the page.');
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-3 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Pages
        </h2>
        <Button size="sm" variant="outline" onClick={() => setCreating((c) => !c)}>
          <Plus data-icon="inline-start" /> New page
        </Button>
      </div>
      {creating && (
        <form
          className="mx-2 mb-2 grid gap-2 rounded-md border p-2.5"
          onSubmit={(e) => {
            e.preventDefault();
            void create();
          }}
        >
          <Label htmlFor="new-page-title" className="text-xs">
            Page name
          </Label>
          <Input
            id="new-page-title"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Menu"
            aria-describedby="new-page-slug"
          />
          <p id="new-page-slug" className="text-[11px] text-muted-foreground">
            Address: {slug}
          </p>
          {error && (
            <p className="text-[11px] text-destructive" role="alert">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-1.5">
            <Button type="button" size="sm" variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Create
            </Button>
          </div>
        </form>
      )}
      <ul className="space-y-0.5 px-2">
        {pages.map((p) => (
          <li key={p.id}>
            <Link
              to="/pages/$pageId"
              params={{ pageId: p.id }}
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
    </div>
  );
}
