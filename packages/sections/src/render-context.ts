import type { Link, PageSummary, SectionInstance } from '@siteos/schemas';
import { resolveLink } from '@siteos/schemas';

/** What every Astro section receives besides its validated props. */
export type RenderContext = {
  mode: 'public' | 'preview';
  pages: PageSummary[];
  href(link: Link): string | undefined;
  /** True for the first content section; used to prioritize likely LCP media. */
  isFirst: boolean;
};

export type SectionRenderProps<P> = { props: P; section: SectionInstance; ctx: RenderContext };

export function createRenderContext(input: {
  mode: RenderContext['mode'];
  pages: PageSummary[];
  isFirst?: boolean;
}): RenderContext {
  const byId = new Map(input.pages.map((p) => [p.id, p.slug]));
  return {
    mode: input.mode,
    pages: input.pages,
    isFirst: input.isFirst ?? false,
    href: (link) => resolveLink(link, { slugForPage: (id) => byId.get(id) }),
  };
}
