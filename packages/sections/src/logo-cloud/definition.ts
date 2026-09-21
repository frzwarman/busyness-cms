import { defineSection } from '../registry/define.ts';
import { imageField, linkField, textField } from '../shared.ts';
import { logoCloudSchema } from './schema.ts';

export const logoCloudDefinition = defineSection({
  type: 'logo-cloud',
  title: 'Logo cloud',
  description: 'Client, partner or press logos. Names render as text until a logo image is added.',
  category: 'social-proof',
  schemaVersion: 1,
  schema: logoCloudSchema,
  defaults: {
    variant: 'row',
    heading: 'Trusted by local businesses',
    logos: [
      { name: 'Bogor Botanic Café', image: null, link: null },
      { name: 'Pajajaran Studio', image: null, link: null },
      { name: 'Sentul Cyclists', image: null, link: null },
      { name: 'Warung Kita', image: null, link: null },
    ],
    grayscale: true,
    theme: 'light',
    spacing: 'compact',
  },
  variants: [
    { value: 'row', label: 'Row', thumbnail: ['L L L L L'] },
    { value: 'grid', label: 'Grid', thumbnail: ['L L L', 'L L L'] },
  ],
  inspector: [
    {
      id: 'heading',
      label: 'Heading',
      fields: [
        textField('heading', 'Heading', 120),
        { path: 'grayscale', label: 'Show logos in grayscale', control: 'toggle' },
      ],
    },
    {
      id: 'logos',
      label: 'Logos',
      fields: [
        {
          path: 'logos',
          label: 'Logos',
          control: 'list',
          itemLabel: 'Logo',
          titlePath: 'name',
          max: 12,
          fields: [
            textField('name', 'Name', 60),
            imageField('image', 'Logo image'),
            linkField('link', 'Link'),
          ],
          newItem: () => ({ name: 'Client', image: null, link: null }),
        },
      ],
    },
  ],
  keywords: ['clients', 'partners', 'press', 'trusted by'],
});
