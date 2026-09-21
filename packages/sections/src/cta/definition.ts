import { defineSection } from '../registry/define.ts';
import { ctaSchema } from './schema.ts';

export const ctaDefinition = defineSection({
  type: 'cta',
  title: 'Call to action',
  description:
    'A focused prompt to book, call, or get in touch. Best placed near the end of a page.',
  category: 'conversion',
  schemaVersion: 1,
  schema: ctaSchema,
  defaults: {
    variant: 'banner',
    eyebrow: '',
    heading: 'Ready to get started?',
    description: 'Reach out today and we will get back to you within one business day.',
    primaryCta: {
      label: 'Contact us',
      link: { kind: 'anchor', anchor: 'contact' },
      style: 'filled',
    },
    secondaryCta: null,
    theme: 'brand',
    spacing: 'standard',
  },
  variants: [
    {
      value: 'banner',
      label: 'Banner',
      description: 'Centered text and buttons',
      thumbnail: ['E', 'H', 'T', 'B B'],
    },
    {
      value: 'card',
      label: 'Card',
      description: 'Contained card on the page surface',
      thumbnail: ['C'],
    },
    {
      value: 'split',
      label: 'Split',
      description: 'Text left, buttons right',
      thumbnail: ['H T | B B'],
    },
  ],
  inspector: [
    {
      id: 'text',
      label: 'Text',
      fields: [
        { path: 'eyebrow', label: 'Eyebrow', control: 'text', maxLength: 80 },
        { path: 'heading', label: 'Heading', control: 'textarea', rows: 2, maxLength: 160 },
        { path: 'description', label: 'Description', control: 'textarea', rows: 3, maxLength: 400 },
      ],
    },
    {
      id: 'buttons',
      label: 'Buttons',
      fields: [
        { path: 'primaryCta', label: 'Primary button', control: 'button' },
        { path: 'secondaryCta', label: 'Secondary button', control: 'button' },
      ],
    },
  ],
  recommendedFor: ['*'],
  keywords: ['contact', 'book', 'convert', 'banner', 'call to action'],
});
