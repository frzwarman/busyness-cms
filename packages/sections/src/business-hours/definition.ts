import { defineSection } from '../registry/define.ts';
import { introInspectorGroup, textField } from '../shared.ts';
import { businessHoursSchema } from './schema.ts';

const row = (day: string, open = '08:00', close = '20:00', closed = false) => ({
  day,
  open,
  close,
  closed,
});

export const businessHoursDefinition = defineSection({
  type: 'business-hours',
  title: 'Opening hours',
  description: 'Weekly hours in a table, with a note for holidays or exceptions.',
  category: 'information',
  schemaVersion: 1,
  schema: businessHoursSchema,
  defaults: {
    variant: 'table',
    eyebrow: '',
    heading: 'Opening hours',
    description: '',
    align: 'left',
    rows: [
      row('Monday – Friday', '07:00', '21:00'),
      row('Saturday', '08:00', '22:00'),
      row('Sunday', '08:00', '20:00'),
      row('Public holidays', '09:00', '17:00'),
    ],
    note: 'Kitchen closes 30 minutes before we do.',
    theme: 'surface',
    spacing: 'standard',
  },
  variants: [
    { value: 'table', label: 'Table', thumbnail: ['T T', 'T T', 'T T'] },
    { value: 'compact', label: 'Compact', description: 'Inline list', thumbnail: ['H', 'E E E'] },
  ],
  inspector: [
    introInspectorGroup,
    {
      id: 'rows',
      label: 'Hours',
      fields: [
        {
          path: 'rows',
          label: 'Days',
          control: 'list',
          itemLabel: 'Day',
          titlePath: 'day',
          max: 10,
          fields: [
            textField('day', 'Day(s)', 40),
            textField('open', 'Opens (24h)', 5),
            textField('close', 'Closes (24h)', 5),
            { path: 'closed', label: 'Closed', control: 'toggle' },
          ],
          newItem: () => row('Day'),
        },
        textField('note', 'Note', 160),
      ],
    },
  ],
  recommendedFor: ['restaurant', 'cafe', 'barbershop', 'clinic', 'gym', 'automotive'],
  keywords: ['hours', 'open', 'schedule', 'times'],
});
