import { z } from 'zod';
import { defineSection } from '../registry/define.ts';
import { sectionStyleFields } from '../shared.ts';
import { richTextDocSchema } from './schema.ts';

export const richTextSectionSchema = z.object({
  variant: z.enum(['narrow', 'wide', 'two-column']),
  body: richTextDocSchema,
  ...sectionStyleFields,
});
export type RichTextSectionProps = z.output<typeof richTextSectionSchema>;

export const richTextDefinition = defineSection({
  type: 'rich-text',
  title: 'Rich text',
  description:
    'Free-form text with headings, lists, links and quotes. Formatting is constrained so the page stays consistent.',
  category: 'content',
  schemaVersion: 1,
  schema: richTextSectionSchema,
  defaults: {
    variant: 'narrow',
    body: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'About this section' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Use rich text for stories, policies, event details or anything that needs a few paragraphs. ',
            },
            { type: 'text', text: 'Headings, lists and links', marks: [{ type: 'bold' }] },
            { type: 'text', text: ' are available; arbitrary HTML is not.' },
          ],
        },
      ],
    },
    theme: 'light',
    spacing: 'standard',
  },
  variants: [
    { value: 'narrow', label: 'Narrow', description: 'Reading width', thumbnail: ['H', 'T', 'T'] },
    { value: 'wide', label: 'Wide', thumbnail: ['H H', 'T T', 'T T'] },
    {
      value: 'two-column',
      label: 'Two columns',
      description: 'Text flows across two columns on wide screens',
      thumbnail: ['T | T', 'T | T'],
    },
  ],
  inspector: [
    {
      id: 'text',
      label: 'Text',
      fields: [{ path: 'body', label: 'Content', control: 'richtext' }],
    },
  ],
  recommendedFor: ['*'],
  keywords: ['text', 'paragraphs', 'article', 'content', 'policy'],
});
