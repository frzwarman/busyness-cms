import type { PageDocument } from '@siteos/schemas';
import { demoAboutPage, demoHomePage, demoPages, demoTheme } from '@siteos/sections/fixtures';

/** Milestone 1 content source: in-repo fixtures. Milestone 3 swaps this for the published-content SDK. */
export const demoSite = {
  name: 'Kopi Sudut',
  theme: demoTheme,
  pages: demoPages,
  pageBySlug(slug: string): PageDocument | undefined {
    return [demoHomePage, demoAboutPage].find((p) => p.slug === slug);
  },
};
