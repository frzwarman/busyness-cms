import { z } from 'zod';
import { pageDocumentSchema, pageSummarySchema } from './page.ts';
import { themeTokensSchema } from './theme.ts';

/**
 * postMessage protocol between Studio (parent) and the preview iframe (renderer).
 * Both sides validate origin AND payload. Nothing here is ever eval'd.
 */
export const PREVIEW_PROTOCOL_VERSION = 1 as const;

export const previewRenderPayloadSchema = z.object({
  page: pageDocumentSchema,
  theme: themeTokensSchema,
  pages: z.array(pageSummarySchema).default([]),
  selectedSectionId: z.string().nullable().default(null),
});
export type PreviewRenderPayload = z.infer<typeof previewRenderPayloadSchema>;

/** Studio → iframe */
export const studioToPreviewMessageSchema = z.discriminatedUnion('type', [
  z.object({
    v: z.literal(PREVIEW_PROTOCOL_VERSION),
    type: z.literal('siteos:render'),
    payload: previewRenderPayloadSchema,
  }),
  z.object({
    v: z.literal(PREVIEW_PROTOCOL_VERSION),
    type: z.literal('siteos:select'),
    sectionId: z.string().nullable(),
  }),
]);
export type StudioToPreviewMessage = z.infer<typeof studioToPreviewMessageSchema>;

/** iframe → Studio */
export const previewToStudioMessageSchema = z.discriminatedUnion('type', [
  z.object({ v: z.literal(PREVIEW_PROTOCOL_VERSION), type: z.literal('siteos:ready') }),
  z.object({
    v: z.literal(PREVIEW_PROTOCOL_VERSION),
    type: z.literal('siteos:rendered'),
    ok: z.boolean(),
    height: z.number().optional(),
    error: z.string().optional(),
  }),
  z.object({
    v: z.literal(PREVIEW_PROTOCOL_VERSION),
    type: z.literal('siteos:selected'),
    sectionId: z.string(),
    fieldPath: z.string().nullable(),
  }),
]);
export type PreviewToStudioMessage = z.infer<typeof previewToStudioMessageSchema>;

/** Origin check helper; `'*'` is never accepted. */
export function isTrustedOrigin(origin: string, allowed: string): boolean {
  return allowed !== '*' && origin === allowed;
}
