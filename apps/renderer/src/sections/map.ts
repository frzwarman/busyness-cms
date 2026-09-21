import Cta from '@siteos/sections/cta/Cta.astro';
import Hero from '@siteos/sections/hero/Hero.astro';
import ImageText from '@siteos/sections/image-text/ImageText.astro';

/**
 * The ONE place that binds section types to Astro renderers.
 * `test/map.test.ts` asserts this stays in sync with the registry.
 */
export const sectionComponents = {
  hero: Hero,
  'image-text': ImageText,
  cta: Cta,
} as const;

export type RenderableType = keyof typeof sectionComponents;
export const renderableTypes = Object.keys(sectionComponents);
