import { defineSection } from '../registry/define.ts';
import { imageField, introInspectorGroup, linkField, textareaField, textField } from '../shared.ts';
import { teamSchema } from './schema.ts';

export const teamDefinition = defineSection({
  type: 'team',
  title: 'Team',
  description: 'The people behind the business, with roles, short bios and photos.',
  category: 'business',
  schemaVersion: 1,
  schema: teamSchema,
  defaults: {
    variant: 'grid',
    eyebrow: 'Team',
    heading: 'The people behind the counter',
    description: '',
    align: 'center',
    members: [
      {
        name: 'Rani Pratama',
        role: 'Head roaster',
        bio: 'Q-grader, ten years in Toraja and Gayo.',
        image: null,
        link: null,
      },
      {
        name: 'Bayu Santoso',
        role: 'Head barista',
        bio: 'Latte-art champion, Jakarta 2024.',
        image: null,
        link: null,
      },
      {
        name: 'Maya Lestari',
        role: 'Pastry',
        bio: 'Up at 4am so the croissants are ready by 7.',
        image: null,
        link: null,
      },
    ],
    theme: 'light',
    spacing: 'standard',
  },
  variants: [
    { value: 'grid', label: 'Grid', thumbnail: ['M | M | M', 'H | H | H'] },
    {
      value: 'list',
      label: 'List',
      description: 'Photo beside bio',
      thumbnail: ['M | H T', 'M | H T'],
    },
  ],
  inspector: [
    introInspectorGroup,
    {
      id: 'members',
      label: 'Members',
      fields: [
        {
          path: 'members',
          label: 'Members',
          control: 'list',
          itemLabel: 'Person',
          titlePath: 'name',
          max: 16,
          fields: [
            textField('name', 'Name', 80),
            textField('role', 'Role', 80),
            textareaField('bio', 'Short bio', 3, 300),
            imageField('image', 'Photo'),
            linkField('link', 'Profile link'),
          ],
          newItem: () => ({ name: 'New team member', role: '', bio: '', image: null, link: null }),
        },
      ],
    },
  ],
  recommendedFor: ['agency', 'law-firm', 'clinic', 'barbershop', 'gym', 'real-estate'],
  keywords: ['people', 'staff', 'attorneys', 'doctors', 'about'],
});
