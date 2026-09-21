import { defineSection } from '../registry/define.ts';
import { imageField, introInspectorGroup, linkField, textareaField, textField } from '../shared.ts';
import { servicesSchema } from './schema.ts';

export const servicesDefinition = defineSection({
  type: 'services',
  title: 'Services',
  description: 'What you offer, with optional prices, photos and links to detail pages.',
  category: 'features',
  schemaVersion: 1,
  schema: servicesSchema,
  defaults: {
    variant: 'cards',
    eyebrow: 'Services',
    heading: 'What we do',
    description: '',
    align: 'left',
    items: [
      {
        title: 'Consultation',
        description: 'A 30-minute call to understand your needs.',
        price: 'Free',
        image: null,
        link: null,
      },
      {
        title: 'Standard package',
        description: 'Our most popular option for small teams.',
        price: 'from Rp 2.5M',
        image: null,
        link: null,
      },
      {
        title: 'Premium package',
        description: 'Priority scheduling and extended support.',
        price: 'from Rp 6M',
        image: null,
        link: null,
      },
    ],
    theme: 'surface',
    spacing: 'standard',
  },
  variants: [
    { value: 'cards', label: 'Cards', thumbnail: ['C | C | C'] },
    {
      value: 'list',
      label: 'List',
      description: 'Compact rows with prices',
      thumbnail: ['H T', 'H T', 'H T'],
    },
    { value: 'image-cards', label: 'Image cards', thumbnail: ['M | M | M', 'H | H | H'] },
  ],
  inspector: [
    introInspectorGroup,
    {
      id: 'items',
      label: 'Services',
      fields: [
        {
          path: 'items',
          label: 'Services',
          control: 'list',
          itemLabel: 'Service',
          titlePath: 'title',
          max: 12,
          fields: [
            textField('title', 'Name', 80),
            textareaField('description', 'Description', 3, 300),
            textField('price', 'Price', 40),
            imageField('image', 'Photo'),
            linkField('link', 'Link'),
          ],
          newItem: () => ({
            title: 'New service',
            description: '',
            price: '',
            image: null,
            link: null,
          }),
        },
      ],
    },
  ],
  recommendedFor: ['*'],
  keywords: ['offer', 'packages', 'treatments', 'menu of services'],
});
