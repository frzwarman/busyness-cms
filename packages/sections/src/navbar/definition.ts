import { defineSection } from '../registry/define.ts';
import { linkField, textField } from '../shared.ts';
import { navbarSchema } from './schema.ts';

export const navbarDefinition = defineSection({
  type: 'navbar',
  title: 'Navigation bar',
  description:
    'Site header with your name or logo, main links and an optional button. Works without JavaScript on mobile.',
  category: 'navigation',
  schemaVersion: 1,
  schema: navbarSchema,
  defaults: {
    variant: 'simple',
    brandName: 'Your business',
    logo: null,
    links: [
      { label: 'Home', link: { kind: 'anchor', anchor: 'main' } },
      { label: 'About', link: { kind: 'anchor', anchor: 'about' } },
      { label: 'Contact', link: { kind: 'anchor', anchor: 'contact' } },
    ],
    cta: { label: 'Get in touch', link: { kind: 'anchor', anchor: 'contact' }, style: 'filled' },
    sticky: false,
    theme: 'light',
    spacing: 'none',
  },
  variants: [
    {
      value: 'simple',
      label: 'Simple',
      description: 'Brand left, links right',
      thumbnail: ['L | T B'],
    },
    {
      value: 'centered',
      label: 'Centered',
      description: 'Brand centered above links',
      thumbnail: ['L', 'T T T'],
    },
    {
      value: 'split',
      label: 'Split',
      description: 'Links on both sides of the brand',
      thumbnail: ['T | L | T B'],
    },
  ],
  inspector: [
    {
      id: 'brand',
      label: 'Brand',
      fields: [
        textField('brandName', 'Business name', 60),
        { path: 'logo', label: 'Logo', control: 'image' },
      ],
    },
    {
      id: 'links',
      label: 'Links',
      fields: [
        {
          path: 'links',
          label: 'Menu links',
          control: 'list',
          itemLabel: 'Link',
          titlePath: 'label',
          max: 8,
          fields: [textField('label', 'Label', 60), linkField('link', 'Goes to')],
          newItem: () => ({ label: 'New link', link: { kind: 'anchor', anchor: 'main' } }),
        },
        { path: 'cta', label: 'Button', control: 'button' },
      ],
    },
    {
      id: 'behaviour',
      label: 'Behaviour',
      fields: [{ path: 'sticky', label: 'Stick to the top while scrolling', control: 'toggle' }],
    },
  ],
  capabilities: { spacing: false },
  recommendedFor: ['*'],
  keywords: ['header', 'menu', 'navigation', 'logo'],
});
