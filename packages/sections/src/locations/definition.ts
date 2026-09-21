import { defineSection } from '../registry/define.ts';
import { imageField, introInspectorGroup, textareaField, textField } from '../shared.ts';
import { locationsSchema } from './schema.ts';

export const locationsDefinition = defineSection({
  type: 'locations',
  title: 'Locations',
  description:
    'Addresses, phone numbers, hours and a “Get directions” link per location. No third-party map scripts.',
  category: 'information',
  schemaVersion: 1,
  schema: locationsSchema,
  defaults: {
    variant: 'single',
    eyebrow: 'Find us',
    heading: 'Visit the roastery',
    description: '',
    align: 'left',
    items: [
      {
        name: 'Kopi Sudut Pajajaran',
        address: 'Jl. Pajajaran No. 12\nBogor Tengah, Bogor 16143',
        phone: '+62 251 555 0100',
        email: 'hello@kopisudut.example',
        hours: 'Daily 07:00 – 21:00',
        mapUrl: 'https://maps.google.com/?q=Jl.+Pajajaran+No.+12+Bogor',
        image: null,
      },
    ],
    theme: 'light',
    spacing: 'standard',
  },
  variants: [
    {
      value: 'single',
      label: 'Single',
      description: 'One location with details',
      thumbnail: ['H T B | M'],
    },
    { value: 'cards', label: 'Cards', thumbnail: ['C | C | C'] },
    { value: 'list', label: 'List', thumbnail: ['H T', 'H T'] },
  ],
  inspector: [
    introInspectorGroup,
    {
      id: 'items',
      label: 'Locations',
      fields: [
        {
          path: 'items',
          label: 'Locations',
          control: 'list',
          itemLabel: 'Location',
          titlePath: 'name',
          max: 8,
          fields: [
            textField('name', 'Name', 80),
            textareaField('address', 'Address', 3, 300),
            textField('phone', 'Phone', 32),
            textField('email', 'Email', 120),
            textField('hours', 'Hours summary', 160),
            textField('mapUrl', 'Directions link (https)', 300),
            imageField('image', 'Photo'),
          ],
          newItem: () => ({
            name: 'New location',
            address: 'Street 1\nCity',
            phone: '',
            email: '',
            hours: '',
            mapUrl: null,
            image: null,
          }),
        },
      ],
    },
  ],
  recommendedFor: [
    'restaurant',
    'cafe',
    'clinic',
    'barbershop',
    'gym',
    'hotel',
    'automotive',
    'real-estate',
  ],
  keywords: ['address', 'map', 'directions', 'contact', 'where'],
});
