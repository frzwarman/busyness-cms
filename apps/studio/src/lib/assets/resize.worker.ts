/// <reference lib="webworker" />
/**
 * Resizes an image off the main thread: decode once, emit WebP at each requested width (never upscaling).
 * Runs as a module Web Worker; the UI stays responsive during large uploads.
 */
export type ResizeRequest = { id: string; file: Blob; widths: number[]; quality?: number };
export type ResizeResult =
  | {
      id: string;
      original: { width: number; height: number };
      variants: Array<{ target: number; width: number; height: number; blob: Blob }>;
    }
  | { id: string; error: string };

self.onmessage = async (e: MessageEvent<ResizeRequest>) => {
  const { id, file, widths, quality = 0.82 } = e.data;
  try {
    const bitmap = await createImageBitmap(file);
    const variants: Array<{ target: number; width: number; height: number; blob: Blob }> = [];
    for (const target of widths) {
      if (target >= bitmap.width) continue; // never upscale
      const scale = target / bitmap.width;
      const w = Math.round(bitmap.width * scale);
      const h = Math.round(bitmap.height * scale);
      const canvas = new OffscreenCanvas(w, h);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas unavailable');
      ctx.drawImage(bitmap, 0, 0, w, h);
      variants.push({
        target,
        width: w,
        height: h,
        blob: await canvas.convertToBlob({ type: 'image/webp', quality }),
      });
    }
    const result: ResizeResult = {
      id,
      original: { width: bitmap.width, height: bitmap.height },
      variants,
    };
    bitmap.close();
    self.postMessage(result);
  } catch (err) {
    self.postMessage({
      id,
      error: err instanceof Error ? err.message : 'Could not process image',
    } satisfies ResizeResult);
  }
};
