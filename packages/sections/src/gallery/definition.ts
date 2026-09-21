import { defineSection } from '../registry/define.ts';
import { imageField, introInspectorGroup, textField } from '../shared.ts';
import { gallerySchema } from './schema.ts';

const img = (src: string, alt: string) => ({
  image: { src, alt, decorative: false, width: 1200, height: 900, focalX: 0.5, focalY: 0.5 },
  caption: '',
});

export const galleryDefinition = defineSection({
  type: 'gallery',
  title: 'Gallery',
  description: 'A grid or masonry of photos with optional captions.',
  category: 'media',
  schemaVersion: 1,
  schema: gallerySchema,
  defaults: {
    variant: 'grid',
    eyebrow: '',
    heading: 'A look inside',
    description: '',
    align: 'left',
    items: [
      img('/demo/cafe-hero.svg', 'The coffee bar counter'),
      img('/demo/roastery.svg', 'Green beans beside the roaster'),
      img('/demo/cafe-hero.svg', 'Morning light at the window seats'),
    ],
    columns: '3',
    theme: 'light',
    spacing: 'standard',
  },
  variants: [
    { value: 'grid', label: 'Grid', thumbnail: ['M | M | M', 'M | M | M'] },
    { value: 'masonry', label: 'Masonry', thumbnail: ['M | M', 'M | M'] },
    {
      value: 'strip',
      label: 'Strip',
      description: 'Horizontal scroll on small screens',
      thumbnail: ['M M M M'],
    },
  ],
  inspector: [
    introInspectorGroup,
    {
      id: 'items',
      label: 'Photos',
      fields: [
        {
          path: 'columns',
          label: 'Columns',
          control: 'segmented',
          options: [
            { value: '2', label: '2' },
            { value: '3', label: '3' },
            { value: '4', label: '4' },
          ],
          responsive: true,
        },
        {
          path: 'items',
          label: 'Photos',
          control: 'list',
          itemLabel: 'Photo',
          titlePath: 'caption',
          max: 24,
          fields: [imageField('image', 'Photo'), textField('caption', 'Caption', 120)],
          newItem: () => img('/demo/roastery.svg', ''),
        },
      ],
    },
  ],
  capabilities: { responsive: ['columns'] },
  performance: { expectedImages: 6 },
  recommendedFor: ['restaurant', 'cafe', 'photographer', 'hotel', 'wedding'],
  keywords: ['photos', 'images', 'pictures', 'portfolio'],
});
