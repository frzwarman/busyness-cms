import { defineSection } from '../registry/define.ts';
import { richTextFromPlain } from '../rich-text/schema.ts';
import { imageTextSchema } from './schema.ts';

export const imageTextDefinition = defineSection({
  type: 'image-text',
  title: 'Image + Text',
  description: 'A story block: one image beside a heading, paragraphs and an optional button.',
  category: 'content',
  schemaVersion: 2,
  schema: imageTextSchema,
  defaults: {
    variant: 'image-left',
    eyebrow: 'Our story',
    heading: 'Built by people who care about the details',
    body: richTextFromPlain(
      'Share what makes your business different. Two or three short paragraphs work best.\n\nKeep the language concrete: what you do, how you do it, and why it matters to your customers.',
    ),
    image: null,
    imageRatio: 'landscape',
    cta: null,
    theme: 'light',
    spacing: 'standard',
  },
  variants: [
    { value: 'image-left', label: 'Image left', thumbnail: ['M | E H T B'] },
    { value: 'image-right', label: 'Image right', thumbnail: ['E H T B | M'] },
    {
      value: 'stacked',
      label: 'Stacked',
      description: 'Image above text',
      thumbnail: ['M', 'E H', 'T T'],
    },
  ],
  inspector: [
    {
      id: 'text',
      label: 'Text',
      fields: [
        { path: 'eyebrow', label: 'Eyebrow', control: 'text', maxLength: 80 },
        { path: 'heading', label: 'Heading', control: 'textarea', rows: 2, maxLength: 160 },
        { path: 'body', label: 'Body', control: 'richtext' },
      ],
    },
    {
      id: 'image',
      label: 'Image',
      fields: [
        { path: 'image', label: 'Image', control: 'image' },
        {
          path: 'imageRatio',
          label: 'Image shape',
          control: 'segmented',
          options: [
            { value: 'square', label: 'Square' },
            { value: 'landscape', label: 'Landscape' },
            { value: 'portrait', label: 'Portrait' },
          ],
        },
      ],
    },
    {
      id: 'button',
      label: 'Button',
      fields: [{ path: 'cta', label: 'Button', control: 'button' }],
    },
  ],
  migrations: [
    {
      // v1 stored `body` as plain text with blank lines between paragraphs; v2 stores constrained rich text.
      from: 1,
      to: 2,
      migrate: ({ body, ...rest }) => ({
        ...rest,
        body: richTextFromPlain(typeof body === 'string' ? body : ''),
      }),
    },
  ],
  performance: { expectedImages: 1 },
  recommendedFor: ['*'],
  keywords: ['about', 'story', 'feature', 'text', 'photo'],
});
