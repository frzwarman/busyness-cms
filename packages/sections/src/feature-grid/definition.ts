import { defineSection } from '../registry/define.ts';
import { iconField, introInspectorGroup, linkField, textareaField, textField } from '../shared.ts';
import { featureGridSchema } from './schema.ts';

export const featureGridDefinition = defineSection({
  type: 'feature-grid',
  title: 'Features',
  description:
    'Why choose you: a grid of benefits with icons and short descriptions. Includes a bento layout.',
  category: 'features',
  schemaVersion: 1,
  schema: featureGridSchema,
  defaults: {
    variant: 'three-column',
    eyebrow: 'Why us',
    heading: 'Everything you need, nothing you don’t',
    description: '',
    align: 'center',
    items: [
      {
        icon: 'zap',
        title: 'Fast turnaround',
        description: 'Most orders are ready within 48 hours.',
        link: null,
        linkLabel: '',
      },
      {
        icon: 'shield',
        title: 'Guaranteed quality',
        description: 'Not happy? We redo it at no cost.',
        link: null,
        linkLabel: '',
      },
      {
        icon: 'heart',
        title: 'Local and personal',
        description: 'A real person answers the phone.',
        link: null,
        linkLabel: '',
      },
    ],
    theme: 'light',
    spacing: 'standard',
  },
  variants: [
    { value: 'three-column', label: 'Three columns', thumbnail: ['I H T | I H T | I H T'] },
    { value: 'two-column', label: 'Two columns', thumbnail: ['I H T | I H T', 'I H T | I H T'] },
    {
      value: 'list',
      label: 'List',
      description: 'Icon beside text',
      thumbnail: ['I | H T', 'I | H T'],
    },
    {
      value: 'bento',
      label: 'Bento',
      description: 'Mixed-size cards',
      thumbnail: ['C C | C', 'C | C C'],
    },
  ],
  inspector: [
    introInspectorGroup,
    {
      id: 'items',
      label: 'Features',
      fields: [
        {
          path: 'items',
          label: 'Features',
          control: 'list',
          itemLabel: 'Feature',
          titlePath: 'title',
          max: 9,
          fields: [
            iconField('icon'),
            textField('title', 'Title', 80),
            textareaField('description', 'Description', 3, 300),
            textField('linkLabel', 'Link label', 40),
            linkField('link', 'Link'),
          ],
          newItem: () => ({
            icon: 'check',
            title: 'New feature',
            description: '',
            link: null,
            linkLabel: '',
          }),
        },
      ],
    },
  ],
  recommendedFor: ['*'],
  keywords: ['benefits', 'bento', 'why', 'usp', 'icons'],
});
