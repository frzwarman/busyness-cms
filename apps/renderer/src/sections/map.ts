import AnnouncementBar from '@siteos/sections/announcement-bar/AnnouncementBar.astro';
import BusinessHours from '@siteos/sections/business-hours/BusinessHours.astro';
import Cta from '@siteos/sections/cta/Cta.astro';
import Faq from '@siteos/sections/faq/Faq.astro';
import FeatureGrid from '@siteos/sections/feature-grid/FeatureGrid.astro';
import Footer from '@siteos/sections/footer/Footer.astro';
import Gallery from '@siteos/sections/gallery/Gallery.astro';
import Hero from '@siteos/sections/hero/Hero.astro';
import ImageText from '@siteos/sections/image-text/ImageText.astro';
import Locations from '@siteos/sections/locations/Locations.astro';
import LogoCloud from '@siteos/sections/logo-cloud/LogoCloud.astro';
import Menu from '@siteos/sections/menu/Menu.astro';
import Navbar from '@siteos/sections/navbar/Navbar.astro';
import Portfolio from '@siteos/sections/portfolio/Portfolio.astro';
import Pricing from '@siteos/sections/pricing/Pricing.astro';
import Process from '@siteos/sections/process/Process.astro';
import Quote from '@siteos/sections/quote/Quote.astro';
import RichTextSection from '@siteos/sections/rich-text/RichTextSection.astro';
import Services from '@siteos/sections/services/Services.astro';
import Stats from '@siteos/sections/stats/Stats.astro';
import Team from '@siteos/sections/team/Team.astro';
import Testimonials from '@siteos/sections/testimonials/Testimonials.astro';
import Video from '@siteos/sections/video/Video.astro';

/**
 * The ONE place that binds section types to Astro renderers.
 * `test/map.test.ts` asserts this stays in sync with the registry.
 */
export const sectionComponents = {
  navbar: Navbar,
  'announcement-bar': AnnouncementBar,
  hero: Hero,
  'rich-text': RichTextSection,
  'image-text': ImageText,
  quote: Quote,
  stats: Stats,
  'feature-grid': FeatureGrid,
  services: Services,
  process: Process,
  'logo-cloud': LogoCloud,
  testimonials: Testimonials,
  gallery: Gallery,
  video: Video,
  cta: Cta,
  faq: Faq,
  'business-hours': BusinessHours,
  locations: Locations,
  menu: Menu,
  pricing: Pricing,
  team: Team,
  portfolio: Portfolio,
  footer: Footer,
} as const;

export type RenderableType = keyof typeof sectionComponents;
export const renderableTypes = Object.keys(sectionComponents);
