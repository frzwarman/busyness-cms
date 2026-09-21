import { defineSection } from '../registry/define.ts';
import { linkField, textField } from '../shared.ts';
import { announcementBarSchema } from './schema.ts';

export const announcementBarDefinition = defineSection({
  type: 'announcement-bar',
  title: 'Announcement bar',
  description: 'A slim strip for a promotion, holiday hours or a notice, with an optional link.',
  category: 'navigation',
  schemaVersion: 1,
  schema: announcementBarSchema,
  defaults: {
    variant: 'bar',
    text: 'Now open on Sundays — 08:00 to 20:00',
    linkLabel: 'See hours',
    link: { kind: 'anchor', anchor: 'hours' },
    theme: 'brand',
    spacing: 'none',
  },
  variants: [
    { value: 'bar', label: 'Full width', thumbnail: ['T B'] },
    {
      value: 'pill',
      label: 'Pill',
      description: 'Rounded badge on the page background',
      thumbnail: ['E'],
    },
  ],
  inspector: [
    {
      id: 'content',
      label: 'Message',
      fields: [
        textField('text', 'Text', 160),
        textField('linkLabel', 'Link label', 40),
        linkField('link', 'Link'),
      ],
    },
  ],
  capabilities: { spacing: false },
  keywords: ['promo', 'banner', 'notice', 'alert'],
});
