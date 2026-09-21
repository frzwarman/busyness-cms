import { z } from 'zod';

/**
 * Reference to an image. `assetId` links to the asset library (Milestone 5); `src` is the
 * resolved URL the renderer uses. Focal point is normalized 0..1 and mapped to object-position.
 */
export const imageRefSchema = z.object({
  assetId: z.string().optional(),
  src: z.string().min(1),
  alt: z.string().max(300).default(''),
  decorative: z.boolean().default(false),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  focalX: z.number().min(0).max(1).default(0.5),
  focalY: z.number().min(0).max(1).default(0.5),
  /** Resized variants (width → URL) from the asset pipeline; the renderer builds srcset from these. */
  sources: z
    .array(z.object({ width: z.number().int().positive(), src: z.string().min(1) }))
    .max(6)
    .optional(),
});
export type ImageRef = z.infer<typeof imageRefSchema>;

export function focalToObjectPosition(img: Pick<ImageRef, 'focalX' | 'focalY'>): string {
  return `${Math.round(img.focalX * 100)}% ${Math.round(img.focalY * 100)}%`;
}
