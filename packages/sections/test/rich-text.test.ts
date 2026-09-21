import { describe, expect, it } from 'vitest';
import {
  renderRichText,
  richTextDocSchema,
  richTextFromPlain,
  richTextToPlain,
} from '../src/index.ts';

describe('rich text', () => {
  it('escapes text and only emits known tags', () => {
    const doc = richTextDocSchema.parse({
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Hi <script>' }] },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'a & b',
              marks: [{ type: 'bold' }, { type: 'link', attrs: { href: 'https://x.io' } }],
            },
            { type: 'hardBreak' },
            { type: 'text', text: 'c' },
          ],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'one' }] }],
            },
          ],
        },
        {
          type: 'blockquote',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'q' }] }],
        },
      ],
    });
    expect(renderRichText(doc)).toBe(
      '<h2>Hi &lt;script&gt;</h2><p><a href="https://x.io" rel="noopener noreferrer"><strong>a &amp; b</strong></a><br>c</p><ul><li>one</li></ul><blockquote><p>q</p></blockquote>',
    );
  });
  it('rejects unsafe link protocols and unknown nodes', () => {
    expect(
      richTextDocSchema.safeParse({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'x',
                marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }],
              },
            ],
          },
        ],
      }).success,
    ).toBe(false);
    expect(
      richTextDocSchema.safeParse({ type: 'doc', content: [{ type: 'iframe' }] }).success,
    ).toBe(false);
    expect(
      richTextDocSchema.safeParse({
        type: 'doc',
        content: [{ type: 'heading', attrs: { level: 1 }, content: [] }],
      }).success,
    ).toBe(false);
  });
  it('round-trips plain text', () => {
    const doc = richTextFromPlain('First para.\n\nSecond para.');
    expect(doc.content).toHaveLength(2);
    expect(richTextToPlain(doc)).toBe('First para.\n\nSecond para.');
  });
});
