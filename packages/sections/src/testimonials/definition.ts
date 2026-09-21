import { defineSection } from '../registry/define.ts';
import { imageField, introInspectorGroup, textareaField, textField } from '../shared.ts';
import { testimonialsSchema } from './schema.ts';

export const testimonialsDefinition = defineSection({
  type: 'testimonials',
  title: 'Testimonials',
  description: 'Customer quotes with names, roles, photos and star ratings.',
  category: 'social-proof',
  schemaVersion: 1,
  schema: testimonialsSchema,
  defaults: {
    variant: 'grid',
    eyebrow: 'Reviews',
    heading: 'What customers say',
    description: '',
    align: 'center',
    items: [
      {
        quote: 'The best flat white in Bogor, and they remember your name.',
        name: 'Dewi P.',
        role: 'Google review',
        image: null,
        rating: 5,
      },
      {
        quote: 'We hold our weekly team breakfast here. Reliable, calm, delicious.',
        name: 'Arif S.',
        role: 'Founder, Pajajaran Studio',
        image: null,
        rating: 5,
      },
      {
        quote: 'Their beans made my home coffee routine finally taste right.',
        name: 'Lina K.',
        role: 'Subscriber',
        image: null,
        rating: 4,
      },
    ],
    showRatings: true,
    theme: 'surface',
    spacing: 'standard',
  },
  variants: [
    { value: 'grid', label: 'Grid', thumbnail: ['C | C | C'] },
    {
      value: 'columns',
      label: 'Columns',
      description: 'Masonry-style columns',
      thumbnail: ['C | C', 'C | C'],
    },
    {
      value: 'single',
      label: 'Single',
      description: 'One quote at a time, large',
      thumbnail: ['T T', 'E'],
    },
  ],
  inspector: [
    introInspectorGroup,
    {
      id: 'items',
      label: 'Testimonials',
      fields: [
        { path: 'showRatings', label: 'Show star ratings', control: 'toggle' },
        {
          path: 'items',
          label: 'Testimonials',
          control: 'list',
          itemLabel: 'Testimonial',
          titlePath: 'name',
          max: 9,
          fields: [
            textareaField('quote', 'Quote', 4, 600),
            textField('name', 'Name', 80),
            textField('role', 'Role or source', 80),
            { path: 'rating', label: 'Rating (0–5)', control: 'number', min: 0, max: 5, step: 1 },
            imageField('image', 'Photo'),
          ],
          newItem: () => ({
            quote: 'Great experience from start to finish.',
            name: 'Customer',
            role: '',
            image: null,
            rating: 5,
          }),
        },
      ],
    },
  ],
  recommendedFor: ['*'],
  keywords: ['reviews', 'quotes', 'social proof', 'ratings'],
});
