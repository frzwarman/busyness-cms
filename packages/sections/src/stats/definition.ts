import { defineSection } from '../registry/define.ts';
import { introInspectorGroup, textField } from '../shared.ts';
import { statsSchema } from './schema.ts';

export const statsDefinition = defineSection({
  type: 'stats',
  title: 'Statistics',
  description:
    'A handful of numbers that prove the point: years in business, customers served, ratings.',
  category: 'content',
  schemaVersion: 1,
  schema: statsSchema,
  defaults: {
    variant: 'row',
    eyebrow: '',
    heading: '',
    description: '',
    align: 'center',
    items: [
      { value: '12+', label: 'Years in business', description: '' },
      { value: '4.9', label: 'Average rating', description: 'from 800 reviews' },
      { value: '3', label: 'Locations', description: '' },
    ],
    theme: 'light',
    spacing: 'standard',
  },
  variants: [
    { value: 'row', label: 'Row', thumbnail: ['H | H | H'] },
    { value: 'grid', label: 'Grid', thumbnail: ['H | H', 'H | H'] },
    { value: 'cards', label: 'Cards', thumbnail: ['C | C | C'] },
  ],
  inspector: [
    introInspectorGroup,
    {
      id: 'items',
      label: 'Numbers',
      fields: [
        {
          path: 'items',
          label: 'Statistics',
          control: 'list',
          itemLabel: 'Statistic',
          titlePath: 'label',
          max: 8,
          fields: [
            textField('value', 'Value', 20),
            textField('label', 'Label', 60),
            textField('description', 'Small print', 120),
          ],
          newItem: () => ({ value: '100%', label: 'New statistic', description: '' }),
        },
      ],
    },
  ],
  keywords: ['numbers', 'metrics', 'facts', 'kpi'],
});
