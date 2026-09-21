import { defineSection } from '../registry/define.ts';
import { richTextFromPlain } from '../rich-text/schema.ts';
import { introInspectorGroup, textField } from '../shared.ts';
import { faqSchema } from './schema.ts';

export const faqDefinition = defineSection({
  type: 'faq',
  title: 'FAQ',
  description:
    'Questions and answers. The accordion works without JavaScript and is keyboard accessible.',
  category: 'information',
  schemaVersion: 1,
  schema: faqSchema,
  defaults: {
    variant: 'accordion',
    eyebrow: 'FAQ',
    heading: 'Questions we hear a lot',
    description: '',
    align: 'left',
    items: [
      {
        question: 'Do you take reservations?',
        answer: richTextFromPlain(
          'Yes, for groups of six or more. Smaller groups can walk in any time.',
        ),
      },
      {
        question: 'Is there parking nearby?',
        answer: richTextFromPlain(
          'There is street parking on Jalan Pajajaran and a paid lot two doors down.',
        ),
      },
      {
        question: 'Do you sell beans to take home?',
        answer: richTextFromPlain(
          'We do. Ask at the counter for this week’s roast, or order online for delivery within Bogor.',
        ),
      },
    ],
    theme: 'light',
    spacing: 'standard',
  },
  variants: [
    { value: 'accordion', label: 'Accordion', thumbnail: ['H', 'H', 'H'] },
    {
      value: 'two-column',
      label: 'Two columns',
      description: 'Heading left, questions right',
      thumbnail: ['H T | H T', ' | H T'],
    },
    {
      value: 'plain',
      label: 'Plain',
      description: 'All answers visible',
      thumbnail: ['H T', 'H T'],
    },
  ],
  inspector: [
    introInspectorGroup,
    {
      id: 'items',
      label: 'Questions',
      fields: [
        {
          path: 'items',
          label: 'Questions',
          control: 'list',
          itemLabel: 'Question',
          titlePath: 'question',
          max: 20,
          fields: [
            textField('question', 'Question', 160),
            { path: 'answer', label: 'Answer', control: 'richtext' },
          ],
          newItem: () => ({
            question: 'New question?',
            answer: richTextFromPlain('Answer goes here.'),
          }),
        },
      ],
    },
  ],
  recommendedFor: ['*'],
  keywords: ['questions', 'answers', 'help', 'support'],
});
