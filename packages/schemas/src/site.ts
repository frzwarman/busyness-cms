import { z } from 'zod';
import { imageRefSchema } from './image.ts';

const httpsUrl = z.url({ protocol: /^https?$/ });

/** Site-wide settings: branding, default SEO, structured data. Snapshotted into `published_settings` on publish. */
export const structuredDataSchema = z.object({
  type: z
    .enum(['none', 'Organization', 'LocalBusiness', 'Restaurant', 'ProfessionalService', 'Hotel'])
    .default('none'),
  legalName: z.string().max(120).default(''),
  telephone: z.string().max(40).default(''),
  email: z.string().max(120).default(''),
  priceRange: z.string().max(20).default(''),
  address: z
    .object({
      street: z.string().max(160).default(''),
      city: z.string().max(80).default(''),
      region: z.string().max(80).default(''),
      postalCode: z.string().max(20).default(''),
      country: z.string().max(2).default(''),
    })
    .default({ street: '', city: '', region: '', postalCode: '', country: '' }),
  /** schema.org openingHours strings, e.g. "Mo-Fr 09:00-17:00" */
  openingHours: z.array(z.string().max(60)).max(14).default([]),
  sameAs: z.array(httpsUrl).max(10).default([]),
});
export type StructuredData = z.infer<typeof structuredDataSchema>;

export const siteSettingsSchema = z.object({
  /** BCP 47 tag for <html lang>, e.g. en, id, en-GB. */
  language: z
    .string()
    .regex(/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/)
    .default('en'),
  tagline: z.string().max(160).default(''),
  /** Default meta description when a page has none. */
  description: z.string().max(300).default(''),
  logo: imageRefSchema.nullable().default(null),
  favicon: imageRefSchema.nullable().default(null),
  ogImage: imageRefSchema.nullable().default(null),
  /** Primary public origin for canonical URLs, e.g. https://kopisudut.com. Empty = derived from the request. */
  canonicalBase: z.string().max(200).default(''),
  twitterHandle: z.string().max(30).default(''),
  structuredData: structuredDataSchema.default({
    type: 'none',
    legalName: '',
    telephone: '',
    email: '',
    priceRange: '',
    address: { street: '', city: '', region: '', postalCode: '', country: '' },
    openingHours: [],
    sameAs: [],
  }),
});
export type SiteSettings = z.infer<typeof siteSettingsSchema>;
export const defaultSiteSettings: SiteSettings = siteSettingsSchema.parse({});
