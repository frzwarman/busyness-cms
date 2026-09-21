import { defineSection } from '../registry/define.ts';
import { imageField, introInspectorGroup, textField } from '../shared.ts';
import { videoSchema } from './schema.ts';

export const videoDefinition = defineSection({
  type: 'video',
  title: 'Video',
  description:
    'A YouTube or Vimeo video (privacy-enhanced embed) or a direct video file, loaded lazily.',
  category: 'media',
  schemaVersion: 1,
  schema: videoSchema,
  defaults: {
    variant: 'inline',
    eyebrow: '',
    heading: '',
    description: '',
    align: 'center',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    poster: null,
    caption: '',
    theme: 'light',
    spacing: 'standard',
  },
  variants: [
    { value: 'inline', label: 'Inline', thumbnail: ['M'] },
    { value: 'full-width', label: 'Full width', thumbnail: ['*M'] },
  ],
  inspector: [
    introInspectorGroup,
    {
      id: 'video',
      label: 'Video',
      fields: [
        textField('url', 'Video URL', 300),
        imageField('poster', 'Poster image (for direct files)'),
        textField('caption', 'Caption', 160),
      ],
    },
  ],
  performance: { javascript: 'none', expectedImages: 1 },
  keywords: ['youtube', 'vimeo', 'embed', 'film'],
});
