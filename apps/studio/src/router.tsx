import { getDraft, getSite, listPages, listSites, saveDraft, updateTheme } from '@siteos/db';
import { registry } from '@siteos/sections';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { useMemo } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { type EditorPersistence, EditorProvider } from '@/editor/EditorProvider';
import { EditorShell } from '@/editor/EditorShell';
import { requireSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { LoginPage } from '@/pages/LoginPage';
import { NewSitePage } from '@/pages/NewSitePage';

export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5_000, retry: 1 } },
});

const sitesQuery = { queryKey: ['sites'], queryFn: () => listSites(supabase) };
const pagesQuery = (siteId: string) => ({
  queryKey: ['pages', siteId],
  queryFn: () => listPages(supabase, siteId),
});
const draftQuery = (pageId: string) => ({
  queryKey: ['draft', pageId],
  queryFn: () => getDraft(supabase, pageId),
  staleTime: Number.POSITIVE_INFINITY,
});

const rootRoute = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Outlet />
      </TooltipProvider>
    </QueryClientProvider>
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: requireSession,
  loader: async () => {
    const sites = await queryClient.ensureQueryData(sitesQuery);
    const site = sites[0];
    if (!site) throw redirect({ to: '/new-site' });
    throw redirect({ to: '/sites/$siteId', params: { siteId: site.id } });
  },
  component: () => null,
});

const newSiteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/new-site',
  beforeLoad: requireSession,
  component: NewSitePage,
});

const siteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sites/$siteId',
  beforeLoad: requireSession,
  loader: async ({ params }) => {
    const pages = await queryClient.ensureQueryData(pagesQuery(params.siteId));
    const home = pages.find((p) => p.slug === '/') ?? pages[0];
    if (home)
      throw redirect({
        to: '/sites/$siteId/pages/$pageId',
        params: { siteId: params.siteId, pageId: home.id },
      });
  },
  component: () => (
    <p className="p-6 text-sm text-muted-foreground">
      This site has no pages yet.{' '}
      <Link to="/" className="underline">
        Back
      </Link>
    </p>
  ),
});

function EditorRoute() {
  const { siteId, pageId } = editorRoute.useParams();
  const { data: site } = useQuery({
    queryKey: ['sites', siteId],
    queryFn: () => getSite(supabase, siteId),
  });
  const { data: pages } = useQuery(pagesQuery(siteId));
  const { data: draft, error } = useQuery(draftQuery(pageId));
  const persistence = useMemo<EditorPersistence>(
    () => ({
      initialRevision: draft?.revision ?? 1,
      savePage: (doc, rev) => saveDraft(supabase, pageId, rev, doc),
      saveTheme: (theme) => updateTheme(supabase, siteId, theme),
    }),
    [pageId, siteId, draft?.revision],
  );
  // Memoized: the provider reloads its state whenever this object identity changes, so it must only
  // change when the draft itself does (not on unrelated re-renders such as the pages list refetching).
  const normalized = useMemo(
    () => (draft ? registry.normalizeDocument(draft.document) : null),
    [draft],
  );
  if (error)
    return (
      <p className="p-6 text-sm text-destructive">Could not load this page: {error.message}</p>
    );
  if (!site || !pages || draft === undefined)
    return <p className="p-6 text-sm text-muted-foreground">Loading your draft…</p>;
  if (draft === null)
    return <p className="p-6 text-sm text-muted-foreground">This page no longer exists.</p>;
  if (!normalized) return null;
  const { document, issues } = normalized;
  if (issues.length) console.warn('Sections kept but not editable:', issues);
  const canEdit = site.role !== 'viewer';
  return (
    <EditorProvider
      key={`${pageId}:${draft.revision}`}
      page={document}
      theme={site.theme}
      pages={pages}
      siteName={site.name}
      siteId={siteId}
      siteSlug={site.slug}
      persistence={persistence}
      canEdit={canEdit}
      canPublish={['owner', 'admin', 'publisher'].includes(site.role)}
    >
      <EditorShell />
    </EditorProvider>
  );
}

const editorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sites/$siteId/pages/$pageId',
  beforeLoad: requireSession,
  loader: ({ params }) =>
    Promise.all([
      queryClient.ensureQueryData(pagesQuery(params.siteId)),
      queryClient.ensureQueryData(draftQuery(params.pageId)),
    ]),
  component: EditorRoute,
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([loginRoute, indexRoute, newSiteRoute, siteRoute, editorRoute]),
  defaultPendingComponent: () => <p className="p-6 text-sm text-muted-foreground">Loading…</p>,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
