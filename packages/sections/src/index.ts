export { ctaDefinition } from './cta/definition.ts';
export { type CtaProps, ctaSchema } from './cta/schema.ts';
export { heroDefinition } from './hero/definition.ts';
export { type HeroProps, heroSchema } from './hero/schema.ts';
export { imageTextDefinition } from './image-text/definition.ts';
export { type ImageTextProps, imageTextSchema } from './image-text/schema.ts';
export { type IconName, iconNames, iconPaths } from './primitives/icons.ts';
export * from './registry/index.ts';
export * from './render-context.ts';
export * from './rich-text/render.ts';
export * from './rich-text/schema.ts';
export * from './shared.ts';
export { embedFor } from './video/schema.ts';

import { announcementBarDefinition } from './announcement-bar/definition.ts';
import { businessHoursDefinition } from './business-hours/definition.ts';
import { contactFormDefinition } from './contact-form/definition.ts';
import { ctaDefinition } from './cta/definition.ts';
import { faqDefinition } from './faq/definition.ts';
import { featureGridDefinition } from './feature-grid/definition.ts';
import { footerDefinition } from './footer/definition.ts';
import { galleryDefinition } from './gallery/definition.ts';
import { heroDefinition } from './hero/definition.ts';
import { imageTextDefinition } from './image-text/definition.ts';
import { locationsDefinition } from './locations/definition.ts';
import { logoCloudDefinition } from './logo-cloud/definition.ts';
import { menuDefinition } from './menu/definition.ts';
import { navbarDefinition } from './navbar/definition.ts';
import { portfolioDefinition } from './portfolio/definition.ts';
import { pricingDefinition } from './pricing/definition.ts';
import { processDefinition } from './process/definition.ts';
import { quoteDefinition } from './quote/definition.ts';
import { SectionRegistry } from './registry/registry.ts';
import { richTextDefinition } from './rich-text/definition.ts';
import { servicesDefinition } from './services/definition.ts';
import { statsDefinition } from './stats/definition.ts';
import { teamDefinition } from './team/definition.ts';
import { testimonialsDefinition } from './testimonials/definition.ts';
import { videoDefinition } from './video/definition.ts';

/** The default registry. Adding a section = add its definition here and its renderer in apps/renderer/src/sections/map.ts. */
export const registry = new SectionRegistry([
  navbarDefinition,
  announcementBarDefinition,
  heroDefinition,
  richTextDefinition,
  imageTextDefinition,
  quoteDefinition,
  statsDefinition,
  featureGridDefinition,
  servicesDefinition,
  processDefinition,
  logoCloudDefinition,
  testimonialsDefinition,
  galleryDefinition,
  videoDefinition,
  ctaDefinition,
  contactFormDefinition,
  faqDefinition,
  businessHoursDefinition,
  locationsDefinition,
  menuDefinition,
  pricingDefinition,
  teamDefinition,
  portfolioDefinition,
  footerDefinition,
]);
export * from './content/collections.ts';
export * from './content/resolve.ts';
export * from './content/source.ts';
