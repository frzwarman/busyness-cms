import { defineSection } from '../registry/define.ts';
import { alignmentOptions } from '../shared.ts';
import { heroSchema } from './schema.ts';

export const heroDefinition = defineSection({
  type: 'hero',
  title: 'Hero',
  description:
    'The opening statement of a page: headline, supporting text, calls to action and optional media.',
  category: 'hero',
  schemaVersion: 1,
  schema: heroSchema,
  defaults: {
    variant: 'split',
    eyebrow: '',
    heading: 'Grow your business with a website that works',
    description: 'Tell visitors what you do, who it is for, and what to do next.',
    alignment: 'left',
    height: 'standard',
    mediaPosition: 'right',
    media: null,
    primaryCta: {
      label: 'Get started',
      link: { kind: 'anchor', anchor: 'contact' },
      style: 'filled',
    },
    secondaryCta: null,
    theme: 'light',
    spacing: 'standard',
  },
  variants: [
    {
      value: 'split',
      label: 'Split',
      description: 'Text beside media',
      thumbnail: ['E H T B | M'],
    },
    {
      value: 'centered',
      label: 'Centered',
      description: 'Centered text, media below',
      thumbnail: ['E', 'H', 'T', 'B B', 'M'],
    },
    {
      value: 'background',
      label: 'Full background',
      description: 'Text over a full-bleed image',
      thumbnail: ['*M E H T B'],
    },
    {
      value: 'editorial',
      label: 'Editorial',
      description: 'Oversized headline, media offset below',
      thumbnail: ['H H | T B', 'M'],
    },
  ],
  inspector: [
    {
      id: 'heading',
      label: 'Heading',
      fields: [
        {
          path: 'eyebrow',
          label: 'Eyebrow',
          control: 'text',
          maxLength: 80,
          placeholder: 'Small line above the heading',
        },
        { path: 'heading', label: 'Heading', control: 'textarea', rows: 2, maxLength: 160 },
        { path: 'description', label: 'Description', control: 'textarea', rows: 4, maxLength: 600 },
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
    {
      id: 'media',
      label: 'Media',
      showWhen: { path: 'variant', values: ['split', 'centered', 'background', 'editorial'] },
      fields: [
        { path: 'media', label: 'Image', control: 'image' },
        {
          path: 'mediaPosition',
          label: 'Media position',
          control: 'segmented',
          options: [
            { value: 'left', label: 'Left' },
            { value: 'right', label: 'Right' },
          ],
          responsive: true,
        },
      ],
    },
    {
      id: 'layout',
      label: 'Layout',
      fields: [
        {
          path: 'alignment',
          label: 'Alignment',
          control: 'segmented',
          options: alignmentOptions,
          responsive: true,
        },
        {
          path: 'height',
          label: 'Height',
          control: 'select',
          options: [
            { value: 'compact', label: 'Compact' },
            { value: 'standard', label: 'Standard' },
            { value: 'large', label: 'Large' },
            { value: 'full', label: 'Full screen' },
          ],
        },
      ],
    },
  ],
  capabilities: { responsive: ['alignment', 'mediaPosition'] },
  performance: { expectedImages: 1, imagePriority: 'high' },
  recommendedFor: ['*'],
  keywords: ['banner', 'header', 'intro', 'headline'],
});
