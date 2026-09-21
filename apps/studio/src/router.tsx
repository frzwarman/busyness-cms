import { registry } from '@siteos/sections';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import {
  createRootRoute,
  createRoute,
  createRouter,
  Navigate,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { TooltipProvider } from '@/components/ui/tooltip';
import { EditorProvider } from '@/editor/EditorProvider';
import { EditorShell } from '@/editor/EditorShell';
import { loadSiteDraft, pageSummaries } from '@/lib/draft-store';

export const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 5_000 } } });
const siteQuery = { queryKey: ['site'], queryFn: loadSiteDraft };

const rootRoute = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Outlet />
      </TooltipProvider>
    </QueryClientProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  loader: async () => {
    const site = await queryClient.ensureQueryData(siteQuery);
    const first = site.pages[0];
    if (first) throw redirect({ to: '/pages/$pageId', params: { pageId: first.id } });
  },
  component: () => <p className="p-6 text-sm text-muted-foreground">No pages yet.</p>,
});

function EditorRoute() {
  const { pageId } = editorRoute.useParams();
  const { data: site } = useQuery(siteQuery);
  if (!site) return <p className="p-6 text-sm text-muted-foreground">Loading your draft…</p>;
  const page = site.pages.find((p) => p.id === pageId);
  if (!page) return <Navigate to="/" />;
  const { document, issues } = registry.normalizeDocument(page);
  if (issues.length) console.warn('Sections kept but not editable:', issues);
  return (
    <EditorProvider
      key={page.id}
      page={document}
      theme={site.theme}
      pages={pageSummaries(site)}
      siteName={site.siteName}
    >
      <EditorShell />
    </EditorProvider>
  );
}

const editorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pages/$pageId',
  loader: () => queryClient.ensureQueryData(siteQuery),
  component: EditorRoute,
});

export const router = createRouter({ routeTree: rootRoute.addChildren([indexRoute, editorRoute]) });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
