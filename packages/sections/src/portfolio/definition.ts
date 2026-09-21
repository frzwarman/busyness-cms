import { defineSection } from '../registry/define.ts';
import { imageField, introInspectorGroup, linkField, textField } from '../shared.ts';
import { portfolioSchema } from './schema.ts';

const img = (src: string, alt: string) => ({
  src,
  alt,
  decorative: false,
  width: 1200,
  height: 900,
  focalX: 0.5,
  focalY: 0.5,
});

export const portfolioDefinition = defineSection({
  type: 'portfolio',
  title: 'Portfolio / projects',
  description: 'Selected work as image cards with a category and link.',
  category: 'business',
  schemaVersion: 1,
  schema: portfolioSchema,
  defaults: {
    variant: 'grid',
    eyebrow: 'Work',
    heading: 'Selected projects',
    description: '',
    align: 'left',
    items: [
      {
        title: 'Bogor Botanic Café rebrand',
        category: 'Branding',
        image: img('/demo/cafe-hero.svg', 'Café counter with new signage'),
        link: null,
      },
      {
        title: 'Roastery packaging',
        category: 'Packaging',
        image: img('/demo/roastery.svg', 'Coffee bags beside the roaster'),
        link: null,
      },
    ],
    theme: 'light',
    spacing: 'standard',
  },
  variants: [
    { value: 'grid', label: 'Grid', thumbnail: ['M | M', 'H | H'] },
    { value: 'masonry', label: 'Masonry', thumbnail: ['M | M', 'M | M'] },
    { value: 'large', label: 'Large', description: 'One project per row', thumbnail: ['M', 'H T'] },
  ],
  inspector: [
    introInspectorGroup,
    {
      id: 'items',
      label: 'Projects',
      fields: [
        {
          path: 'items',
          label: 'Projects',
          control: 'list',
          itemLabel: 'Project',
          titlePath: 'title',
          max: 12,
          fields: [
            textField('title', 'Title', 80),
            textField('category', 'Category', 60),
            imageField('image', 'Cover image'),
            linkField('link', 'Link'),
          ],
          newItem: () => ({ title: 'New project', category: '', image: null, link: null }),
        },
      ],
    },
  ],
  recommendedFor: ['agency', 'photographer', 'freelancer', 'construction', 'wedding'],
  keywords: ['work', 'projects', 'case studies', 'showcase'],
});
