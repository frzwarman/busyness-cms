import { z } from 'zod';

/**
 * Constrained rich text: a subset of ProseMirror/Tiptap JSON. Only these nodes and marks exist, so the
 * renderer emits HTML from a known tree and never has to sanitize arbitrary markup.
 */
const safeHref = z
  .string()
  .regex(/^(https?:\/\/|mailto:|tel:|\/|#)/, 'Links must be http(s), mailto:, tel:, or relative');

const markSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('bold') }),
  z.object({ type: z.literal('italic') }),
  z.object({ type: z.literal('code') }),
  z.object({
    type: z.literal('link'),
    attrs: z.object({ href: safeHref, target: z.string().optional().nullable() }).loose(),
  }),
]);

const textNode = z.object({
  type: z.literal('text'),
  text: z.string(),
  marks: z.array(markSchema).optional(),
});
const hardBreak = z.object({ type: z.literal('hardBreak') });
const inline = z.union([textNode, hardBreak]);

const paragraph = z.object({ type: z.literal('paragraph'), content: z.array(inline).optional() });
const heading = z.object({
  type: z.literal('heading'),
  attrs: z.object({ level: z.union([z.literal(2), z.literal(3)]) }),
  content: z.array(inline).optional(),
});
const listItem = z.object({ type: z.literal('listItem'), content: z.array(paragraph).optional() });
const bulletList = z.object({ type: z.literal('bulletList'), content: z.array(listItem) });
const orderedList = z.object({
  type: z.literal('orderedList'),
  attrs: z.object({ start: z.number().int().optional() }).optional(),
  content: z.array(listItem),
});
const blockquote = z.object({ type: z.literal('blockquote'), content: z.array(paragraph) });

export const richTextBlockSchema = z.discriminatedUnion('type', [
  paragraph,
  heading,
  bulletList,
  orderedList,
  blockquote,
]);
export const richTextDocSchema = z.object({
  type: z.literal('doc'),
  content: z.array(richTextBlockSchema).max(200),
});
export type RichTextDoc = z.infer<typeof richTextDocSchema>;
export type RichTextBlock = z.infer<typeof richTextBlockSchema>;

export const emptyRichText: RichTextDoc = { type: 'doc', content: [] };

/** Plain text → one paragraph per blank-line-separated chunk. Used by migrations and seeds. */
export function richTextFromPlain(text: string): RichTextDoc {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return {
    type: 'doc',
    content: paragraphs.map((p) => ({ type: 'paragraph', content: [{ type: 'text', text: p }] })),
  };
}

export function richTextToPlain(doc: RichTextDoc): string {
  const inlineText = (nodes?: Array<{ type: string; text?: string }>) =>
    (nodes ?? []).map((n) => (n.type === 'text' ? (n.text ?? '') : '\n')).join('');
  return doc.content
    .map((b) => {
      if (b.type === 'paragraph' || b.type === 'heading') return inlineText(b.content);
      if (b.type === 'blockquote') return b.content.map((p) => inlineText(p.content)).join('\n');
      return b.content
        .map((li) => `• ${(li.content ?? []).map((p) => inlineText(p.content)).join(' ')}`)
        .join('\n');
    })
    .join('\n\n');
}
