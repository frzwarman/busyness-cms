export { ctaDefinition } from './cta/definition.ts';
export { type CtaProps, ctaSchema } from './cta/schema.ts';
export { heroDefinition } from './hero/definition.ts';
export { type HeroProps, heroSchema } from './hero/schema.ts';
export { imageTextDefinition } from './image-text/definition.ts';
export { type ImageTextProps, imageTextSchema } from './image-text/schema.ts';
export * from './registry/index.ts';
export * from './render-context.ts';
export * from './shared.ts';

import { ctaDefinition } from './cta/definition.ts';
import { heroDefinition } from './hero/definition.ts';
import { imageTextDefinition } from './image-text/definition.ts';
import { SectionRegistry } from './registry/registry.ts';

/** The default registry. Adding a section = add its definition here and its renderer in the renderer map. */
export const registry = new SectionRegistry([heroDefinition, imageTextDefinition, ctaDefinition]);
