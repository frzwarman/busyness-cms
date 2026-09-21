import { defineSection } from '../registry/define.ts';
import { introInspectorGroup, textareaField, textField } from '../shared.ts';
import { processSchema } from './schema.ts';

export const processDefinition = defineSection({
  type: 'process',
  title: 'Process / steps',
  description: 'How working with you goes, in numbered steps.',
  category: 'features',
  schemaVersion: 1,
  schema: processSchema,
  defaults: {
    variant: 'horizontal',
    eyebrow: 'How it works',
    heading: 'Three steps to get started',
    description: '',
    align: 'center',
    steps: [
      { title: 'Tell us what you need', description: 'Call, message or fill in the form.' },
      { title: 'Get a clear quote', description: 'Fixed price, no surprises.' },
      { title: 'We get it done', description: 'On time, and we tidy up after.' },
    ],
    theme: 'light',
    spacing: 'standard',
  },
  variants: [
    { value: 'horizontal', label: 'Horizontal', thumbnail: ['I H T | I H T | I H T'] },
    {
      value: 'vertical',
      label: 'Vertical',
      description: 'Timeline down the page',
      thumbnail: ['I | H T', 'I | H T', 'I | H T'],
    },
    { value: 'cards', label: 'Cards', thumbnail: ['C | C | C'] },
  ],
  inspector: [
    introInspectorGroup,
    {
      id: 'steps',
      label: 'Steps',
      fields: [
        {
          path: 'steps',
          label: 'Steps',
          control: 'list',
          itemLabel: 'Step',
          titlePath: 'title',
          max: 6,
          fields: [
            textField('title', 'Title', 80),
            textareaField('description', 'Description', 3, 300),
          ],
          newItem: () => ({ title: 'Next step', description: '' }),
        },
      ],
    },
  ],
  keywords: ['how it works', 'steps', 'timeline', 'onboarding'],
});
