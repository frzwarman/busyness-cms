import { defineSection } from '../registry/define.ts';
import { introInspectorGroup, textareaField } from '../shared.ts';
import { contactFormSchema } from './schema.ts';

export const contactFormDefinition = defineSection({
  type: 'contact-form',
  title: 'Form',
  description:
    'A contact, quote, booking or newsletter form. Submissions land in your inbox; no third-party service needed.',
  category: 'conversion',
  schemaVersion: 1,
  schema: contactFormSchema,
  defaults: {
    variant: 'split',
    eyebrow: 'Contact',
    heading: 'Tell us what you need',
    description: 'We reply within one business day.',
    align: 'left',
    formId: null,
    form: null,
    aside: 'Prefer to talk? Call +62 251 555 0100, or visit us at Jl. Pajajaran No. 12, Bogor.',
    theme: 'light',
    spacing: 'standard',
  },
  variants: [
    {
      value: 'split',
      label: 'Split',
      description: 'Heading and details beside the form',
      thumbnail: ['H T | T T B'],
    },
    { value: 'stacked', label: 'Stacked', thumbnail: ['H', 'T T', 'B'] },
    { value: 'card', label: 'Card', description: 'Form in a raised card', thumbnail: ['H', 'C'] },
  ],
  inspector: [
    introInspectorGroup,
    {
      id: 'form',
      label: 'Form',
      fields: [{ path: 'formId', label: 'Form', control: 'form-picker' }],
    },
    {
      id: 'aside',
      label: 'Side note',
      showWhen: { path: 'variant', values: ['split'] },
      fields: [textareaField('aside', 'Text beside the form', 4, 600)],
    },
  ],
  performance: { javascript: 'none' },
  recommendedFor: ['*'],
  keywords: ['contact', 'lead', 'booking', 'quote', 'newsletter', 'enquiry'],
});
