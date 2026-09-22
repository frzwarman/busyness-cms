import { getDraft } from '@siteos/db';
import {
  type CategoryStatus,
  formatKb,
  type HealthCategory,
  type HealthIssue,
  runHealthChecks,
} from '@siteos/health';
import { registry } from '@siteos/sections';
import { useQueries } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, Loader2, RefreshCw } from 'lucide-react';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useEditor } from '../EditorProvider';

const categoryLabels: Record<HealthCategory, string> = {
  brand: 'Brand',
  seo: 'SEO',
  accessibility: 'Accessibility',
  content: 'Content',
  performance: 'Performance',
};
const statusLabels: Record<CategoryStatus, string> = {
  excellent: 'Excellent',
  good: 'Good',
  'needs-attention': 'Needs attention',
};

/**
 * Website Health: deterministic checks over every draft page plus the site's settings and theme, and the
 * measured weight of the page in the preview. Issues link to where they can be fixed.
 */
export function HealthPanel({ onOpenTool }: { onOpenTool: (tool: 'settings' | 'brand') => void }) {
  const { state, pages, siteId, siteSettings, theme, pageWeight, requestFocus, openPageSeo } =
    useEditor();
  const navigate = useNavigate();
  const drafts = useQueries({
    queries: pages.map((p) => ({
      queryKey: ['draft', p.id],
      queryFn: () => getDraft(supabase, p.id),
      staleTime: 30_000,
    })),
  });
  const loading = drafts.some((d) => d.isLoading);
  const report = useMemo(() => {
    const docs = pages.flatMap((p, i) => {
      // The page being edited is checked from the live editor state, others from their saved drafts.
      const doc = p.id === state.document.id ? state.document : drafts[i]?.data?.document;
      return doc ? [{ summary: p, document: doc }] : [];
    });
    return runHealthChecks({ pages: docs, settings: siteSettings, theme, registry });
  }, [pages, drafts, state.document, siteSettings, theme]);

  const go = (issue: HealthIssue) => {
    const t = issue.target;
    if (t.kind === 'settings') return onOpenTool(t.area === 'brand' ? 'brand' : 'settings');
    if (t.kind === 'page-seo') {
      if (t.pageId !== state.document.id)
        void navigate({ to: '/sites/$siteId/pages/$pageId', params: { siteId, pageId: t.pageId } });
      return openPageSeo();
    }
    if (t.pageId !== state.document.id)
      return void navigate({
        to: '/sites/$siteId/pages/$pageId',
        params: { siteId, pageId: t.pageId },
      });
    if (t.sectionId) requestFocus(t.sectionId, t.fieldPath ?? null);
  };

  const order: HealthCategory[] = ['seo', 'accessibility', 'content', 'performance', 'brand'];
  return (
    <div className="grid gap-4 p-3">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Website health
        </h2>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Checked {report.checkedPages} page{report.checkedPages === 1 ? '' : 's'} plus your
          settings. These checks catch common problems; they don’t replace testing with real people.
          {loading && <Loader2 className="ml-1 inline size-3 animate-spin" />}
        </p>
      </div>

      <dl className="grid gap-1.5">
        {order.map((c) => {
          const cat = report.categories[c];
          return (
            <div
              key={c}
              className="flex items-center justify-between rounded-md border px-2.5 py-1.5 text-sm"
            >
              <dt className="font-medium">{categoryLabels[c]}</dt>
              <dd
                className={cn(
                  'flex items-center gap-1.5 text-xs',
                  cat.status === 'excellent' && 'text-emerald-700 dark:text-emerald-400',
                  cat.status === 'good' && 'text-amber-600',
                  cat.status === 'needs-attention' && 'text-destructive',
                )}
              >
                {cat.status === 'excellent' ? (
                  <CheckCircle2 className="size-3.5" />
                ) : cat.status === 'good' ? (
                  <AlertTriangle className="size-3.5" />
                ) : (
                  <AlertCircle className="size-3.5" />
                )}
                {statusLabels[cat.status]}
                {cat.count > 0 && (
                  <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                    {cat.count}
                  </Badge>
                )}
              </dd>
            </div>
          );
        })}
      </dl>

      <section aria-labelledby="weight-title" className="rounded-md border p-2.5">
        <h3 id="weight-title" className="text-xs font-medium">
          This page in the preview
        </h3>
        {pageWeight ? (
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <dt className="text-muted-foreground">Total transferred</dt>
            <dd className="text-right font-medium">{formatKb(pageWeight.total)}</dd>
            <dt className="text-muted-foreground">Images</dt>
            <dd className="text-right">{formatKb(pageWeight.images)}</dd>
            <dt className="text-muted-foreground">Fonts</dt>
            <dd className="text-right">{formatKb(pageWeight.fonts)}</dd>
            <dt className="text-muted-foreground">HTML</dt>
            <dd className="text-right">{formatKb(pageWeight.html)}</dd>
            <dt className="text-muted-foreground">CSS</dt>
            <dd className="text-right">{formatKb(pageWeight.css)}</dd>
            <dt className="text-muted-foreground">JavaScript</dt>
            <dd className="text-right">{formatKb(pageWeight.js)}</dd>
            <dt className="text-muted-foreground">Requests</dt>
            <dd className="text-right">{pageWeight.requests}</dd>
            <dt className="text-muted-foreground">Interactive sections</dt>
            <dd className="text-right">
              {
                state.document.sections.filter(
                  (s) => !s.hidden && (s.type === 'video' || s.type === 'contact-form'),
                ).length
              }
            </dd>
          </dl>
        ) : (
          <p className="mt-1 text-[11px] text-muted-foreground">
            Measured after the preview renders.
          </p>
        )}
        <p className="mt-2 text-[11px] text-muted-foreground">
          Measured from what the preview actually downloaded at desktop width. Not a Lighthouse
          score.
        </p>
      </section>

      <section aria-labelledby="issues-title">
        <div className="flex items-center justify-between">
          <h3 id="issues-title" className="text-xs font-medium">
            Issues ({report.issues.length})
          </h3>
          <Button size="xs" variant="ghost" onClick={() => drafts.forEach((d) => void d.refetch())}>
            <RefreshCw /> Re-check
          </Button>
        </div>
        {report.issues.length === 0 ? (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="size-3.5" /> Nothing to fix. Publish when you’re ready.
          </p>
        ) : (
          <ul className="mt-2 grid gap-1" aria-label="Health issues">
            {report.issues.map((i) => (
              <li key={i.id}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  className="flex w-full items-start gap-2 rounded-md border p-2 text-left text-xs hover:bg-muted"
                >
                  {i.severity === 'error' ? (
                    <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                  ) : i.severity === 'warning' ? (
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                  ) : (
                    <Info className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                  )}
                  <span className="min-w-0">
                    <span className="block font-medium">{i.message}</span>
                    <span className="block text-muted-foreground">{i.fix}</span>
                  </span>
                  <Badge variant="outline" className="ml-auto shrink-0 text-[10px]">
                    {categoryLabels[i.category]}
                  </Badge>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
