import { defineSection } from '../registry/define.ts';
import { introInspectorGroup, textField } from '../shared.ts';
import { menuSchema } from './schema.ts';

const item = (name: string, price: string, description = '', tags = '') => ({
  name,
  description,
  price,
  tags,
});

export const menuDefinition = defineSection({
  type: 'menu',
  title: 'Menu',
  description: 'Restaurant or café menu grouped into categories, with prices and dietary tags.',
  category: 'business',
  schemaVersion: 1,
  schema: menuSchema,
  defaults: {
    variant: 'columns',
    eyebrow: 'Menu',
    heading: 'This week at the bar',
    description: '',
    align: 'center',
    groups: [
      {
        title: 'Coffee',
        items: [
          item('Flat white', '32k', 'Double ristretto, silky milk'),
          item('Pour over', '38k', 'Single origin, rotates weekly', 'V'),
          item('Es kopi susu', '28k', 'Our take on the classic'),
        ],
      },
      {
        title: 'Pastry',
        items: [
          item('Butter croissant', '24k', '', 'V'),
          item('Pandan roll', '22k', 'Coconut glaze', 'V'),
          item('Banana bread', '20k', '', 'V GF'),
        ],
      },
    ],
    note: 'V vegetarian · GF gluten free · Prices in IDR',
    theme: 'surface',
    spacing: 'standard',
  },
  variants: [
    { value: 'columns', label: 'Columns', thumbnail: ['H T T | H T T'] },
    {
      value: 'list',
      label: 'List',
      description: 'One category after another',
      thumbnail: ['H', 'T T', 'H', 'T T'],
    },
  ],
  inspector: [
    introInspectorGroup,
    {
      id: 'groups',
      label: 'Categories',
      fields: [
        {
          path: 'groups',
          label: 'Categories',
          control: 'list',
          itemLabel: 'Category',
          titlePath: 'title',
          max: 12,
          fields: [
            textField('title', 'Category name', 80),
            {
              path: 'items',
              label: 'Dishes',
              control: 'list',
              itemLabel: 'Dish',
              titlePath: 'name',
              max: 30,
              fields: [
                textField('name', 'Name', 80),
                textField('description', 'Description', 200),
                textField('price', 'Price', 30),
                textField('tags', 'Tags (e.g. V GF)', 60),
              ],
              newItem: () => item('New dish', ''),
            },
          ],
          newItem: () => ({ title: 'New category', items: [item('New dish', '')] }),
        },
        textField('note', 'Footnote', 160),
      ],
    },
  ],
  recommendedFor: ['restaurant', 'cafe'],
  keywords: ['food', 'drinks', 'dishes', 'prices', 'restaurant'],
});
