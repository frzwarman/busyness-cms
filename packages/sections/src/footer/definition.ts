import { defineSection } from '../registry/define.ts';
import { linkField, textField } from '../shared.ts';
import { footerSchema } from './schema.ts';

const links = {
  path: 'links',
  label: 'Links',
  control: 'list' as const,
  itemLabel: 'Link',
  titlePath: 'label',
  max: 10,
  fields: [textField('label', 'Label', 60), linkField('link', 'Goes to')],
  newItem: () => ({ label: 'New link', link: { kind: 'anchor', anchor: 'main' } }),
};

export const footerDefinition = defineSection({
  type: 'footer',
  title: 'Footer',
  description: 'Closing block with your name, link columns, legal links and copyright.',
  category: 'footer',
  schemaVersion: 1,
  schema: footerSchema,
  defaults: {
    variant: 'columns',
    brandName: 'Your business',
    tagline: 'Good coffee, slow mornings.',
    columns: [
      {
        title: 'Explore',
        links: [
          { label: 'Menu', link: { kind: 'anchor', anchor: 'menu' } },
          { label: 'About', link: { kind: 'anchor', anchor: 'about' } },
        ],
      },
      {
        title: 'Contact',
        links: [
          { label: 'hello@example.com', link: { kind: 'email', email: 'hello@example.com' } },
          { label: '+62 251 555 0100', link: { kind: 'phone', phone: '+62 251 555 0100' } },
        ],
      },
    ],
    copyright: `© ${new Date().getFullYear()} Your business. All rights reserved.`,
    legalLinks: [],
    theme: 'dark',
    spacing: 'standard',
  },
  variants: [
    { value: 'simple', label: 'Simple', description: 'One row', thumbnail: ['L | T T T'] },
    { value: 'columns', label: 'Columns', thumbnail: ['L T | T T | T T', 'E'] },
    { value: 'centered', label: 'Centered', thumbnail: ['L', 'T T T', 'E'] },
  ],
  inspector: [
    {
      id: 'brand',
      label: 'Brand',
      fields: [textField('brandName', 'Business name', 60), textField('tagline', 'Tagline', 160)],
    },
    {
      id: 'columns',
      label: 'Link columns',
      fields: [
        {
          path: 'columns',
          label: 'Columns',
          control: 'list',
          itemLabel: 'Column',
          titlePath: 'title',
          max: 4,
          fields: [textField('title', 'Column title', 60), links],
          newItem: () => ({ title: 'Links', links: [] }),
        },
      ],
    },
    {
      id: 'legal',
      label: 'Legal',
      fields: [
        textField('copyright', 'Copyright line', 120),
        { ...links, path: 'legalLinks', label: 'Legal links', max: 6 },
      ],
    },
  ],
  recommendedFor: ['*'],
  keywords: ['bottom', 'copyright', 'links', 'contact'],
});
