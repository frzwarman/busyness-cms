import type { Link, PageSummary, SectionInstance } from '@siteos/schemas';
import { resolveLink } from '@siteos/schemas';

/** What every Astro section receives besides its validated props. */
export type RenderContext = {
  mode: 'public' | 'preview';
  pages: PageSummary[];
  href(link: Link): string | undefined;
  /** True for the first content section; used to prioritize likely LCP media. */
  isFirst: boolean;
  /** Origin of the edge worker that receives form posts; undefined disables forms. */
  formsEndpoint?: string;
  /** Slug of the page being rendered (sent with submissions). */
  pageSlug?: string;
  /** Set after a no-JS post redirected back: the form that was just submitted. */
  submittedFormId?: string;
};

export type SectionRenderProps<P> = { props: P; section: SectionInstance; ctx: RenderContext };

export function createRenderContext(input: {
  mode: RenderContext['mode'];
  pages: PageSummary[];
  isFirst?: boolean;
  formsEndpoint?: string;
  pageSlug?: string;
  submittedFormId?: string;
}): RenderContext {
  const byId = new Map(input.pages.map((p) => [p.id, p.slug]));
  return {
    mode: input.mode,
    pages: input.pages,
    isFirst: input.isFirst ?? false,
    formsEndpoint: input.formsEndpoint,
    pageSlug: input.pageSlug,
    submittedFormId: input.submittedFormId,
    href: (link) => resolveLink(link, { slugForPage: (id) => byId.get(id) }),
  };
}
