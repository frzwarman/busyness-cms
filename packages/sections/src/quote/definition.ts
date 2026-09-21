import { defineSection } from '../registry/define.ts';
import { imageField, textareaField, textField } from '../shared.ts';
import { quoteSchema } from './schema.ts';

export const quoteDefinition = defineSection({
  type: 'quote',
  title: 'Quote',
  description: 'One standout quote from a customer, founder or the press, with attribution.',
  category: 'content',
  schemaVersion: 1,
  schema: quoteSchema,
  defaults: {
    variant: 'plain',
    text: 'They roast on Tuesdays and you can taste it on Wednesday.',
    author: 'Sari W.',
    role: 'Regular since 2020',
    image: null,
    theme: 'surface',
    spacing: 'standard',
  },
  variants: [
    { value: 'plain', label: 'Plain', thumbnail: ['T T', 'E'] },
    { value: 'card', label: 'Card', thumbnail: ['C'] },
    {
      value: 'large',
      label: 'Large',
      description: 'Oversized display text',
      thumbnail: ['H H', 'E'],
    },
  ],
  inspector: [
    {
      id: 'quote',
      label: 'Quote',
      fields: [
        textareaField('text', 'Quote', 4, 600),
        textField('author', 'Name', 80),
        textField('role', 'Role or context', 80),
      ],
    },
    { id: 'image', label: 'Photo', fields: [imageField('image', 'Photo')] },
  ],
  keywords: ['testimonial', 'review', 'press'],
});
