import { z } from 'zod';
import { imageRefSchema, sectionIntroFields, sectionStyleFields } from '../shared.ts';

/** Only YouTube and Vimeo URLs (or a direct mp4/webm file) are accepted; the renderer derives a privacy-friendly embed. */
export const videoUrlSchema = z
  .url({ protocol: /^https$/ })
  .refine(
    (u) => /(^https:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\/)|\.(mp4|webm)$/i.test(u),
    'Use a YouTube, Vimeo or direct .mp4/.webm link',
  );
export const videoSchema = z.object({
  variant: z.enum(['inline', 'full-width']),
  ...sectionIntroFields,
  url: videoUrlSchema,
  poster: imageRefSchema.nullable().default(null),
  caption: z.string().max(160).default(''),
  ...sectionStyleFields,
});
export type VideoProps = z.output<typeof videoSchema>;

export function embedFor(
  url: string,
): { kind: 'youtube' | 'vimeo'; src: string } | { kind: 'file'; src: string } | null {
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );
  if (yt?.[1]) return { kind: 'youtube', src: `https://www.youtube-nocookie.com/embed/${yt[1]}` };
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d{5,})/);
  if (vm?.[1]) return { kind: 'vimeo', src: `https://player.vimeo.com/video/${vm[1]}?dnt=1` };
  if (/\.(mp4|webm)$/i.test(url)) return { kind: 'file', src: url };
  return null;
}
