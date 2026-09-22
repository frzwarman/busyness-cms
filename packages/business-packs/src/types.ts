import type { FormField, ImageRef, StructuredData } from '@siteos/schemas';
import type { IconName } from '@siteos/sections';

export type RecipeId =
  | 'home'
  | 'generate-leads'
  | 'sell-service'
  | 'explain-pricing'
  | 'show-portfolio'
  | 'build-trust'
  | 'collect-bookings'
  | 'promote-event'
  | 'show-menu'
  | 'recruit'
  | 'contact'
  | 'gallery'
  | 'blank';

export type FormTemplateId = 'contact' | 'quote' | 'newsletter' | 'booking' | 'job';

/** What the owner tells us once; every recipe reuses it. */
export type SiteDetails = {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  /** Street line, e.g. "Jl. Pajajaran No. 12" */
  street: string;
  city: string;
};

export type PackContent = {
  hero: {
    eyebrow: string;
    heading: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
  };
  about: { eyebrow: string; heading: string; body: string };
  features: Array<{ icon: IconName; title: string; description: string }>;
  services: Array<{ title: string; description: string; price: string }>;
  process: Array<{ title: string; description: string }>;
  stats: Array<{ value: string; label: string; description?: string }>;
  testimonials: Array<{ quote: string; name: string; role: string; rating: number }>;
  faq: Array<{ question: string; answer: string }>;
  cta: { eyebrow: string; heading: string; description: string; label: string };
  team: Array<{ name: string; role: string; bio: string }>;
  hours: Array<{ day: string; open: string; close: string; closed?: boolean }>;
  menu?: Array<{
    title: string;
    items: Array<{ name: string; description: string; price: string; tags?: string }>;
  }>;
  pricing?: Array<{
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    highlighted?: boolean;
    badge?: string;
  }>;
  portfolio?: Array<{ title: string; category: string }>;
  /** Copy for the "why work with us" block on a careers page. */
  careers?: {
    heading: string;
    description: string;
    perks: Array<{ icon: IconName; title: string; description: string }>;
  };
};

export type SuggestedPage = {
  /** Stable key other pages link to (e.g. hero CTA → 'contact'). */
  key: string;
  title: string;
  slug: string;
  recipe: RecipeId;
  description: string;
  /** Pre-checked in the wizard. */
  recommended: boolean;
};

export type BusinessPack = {
  id: string;
  name: string;
  description: string;
  icon: IconName;
  suggestedPreset: string;
  structuredDataType: StructuredData['type'];
  /** Section types the home page recipe lays out, in order (pack-specific composition). */
  homeSections: string[];
  suggestedPages: SuggestedPage[];
  /** Which forms the site should start with; 'contact' is always created. */
  forms: FormTemplateId[];
  vocabulary: { offerings: string; primaryAction: string };
  content: PackContent;
};

export type BuildContext = {
  pack: BusinessPack;
  details: SiteDetails;
  /** page key → page id for internal links. Missing keys fall back to anchors. */
  pageIds: Record<string, string>;
  /** form template id → form id. */
  formIds: Partial<Record<FormTemplateId, string>>;
  /** Placeholder imagery. Owners replace these from the asset library. */
  images: ImageRef[];
};

export type { FormField };
