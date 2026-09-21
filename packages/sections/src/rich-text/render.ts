import type { RichTextBlock, RichTextDoc } from './schema.ts';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

type Inline =
  | {
      type: 'text';
      text: string;
      marks?: Array<{ type: string; attrs?: { href?: string; target?: string | null } }>;
    }
  | { type: 'hardBreak' };

function renderInline(nodes: Inline[] | undefined): string {
  return (nodes ?? [])
    .map((n) => {
      if (n.type === 'hardBreak') return '<br>';
      let out = esc(n.text);
      for (const m of n.marks ?? []) {
        if (m.type === 'bold') out = `<strong>${out}</strong>`;
        else if (m.type === 'italic') out = `<em>${out}</em>`;
        else if (m.type === 'code') out = `<code>${out}</code>`;
        else if (m.type === 'link' && m.attrs?.href) {
          const external = /^https?:\/\//.test(m.attrs.href);
          out = `<a href="${esc(m.attrs.href)}"${external ? ' rel="noopener noreferrer"' : ''}>${out}</a>`;
        }
      }
      return out;
    })
    .join('');
}

function renderBlock(b: RichTextBlock): string {
  switch (b.type) {
    case 'paragraph':
      return `<p>${renderInline(b.content as Inline[] | undefined)}</p>`;
    case 'heading':
      return `<h${b.attrs.level}>${renderInline(b.content as Inline[] | undefined)}</h${b.attrs.level}>`;
    case 'bulletList':
    case 'orderedList': {
      const tag = b.type === 'bulletList' ? 'ul' : 'ol';
      const start =
        b.type === 'orderedList' && b.attrs?.start && b.attrs.start !== 1
          ? ` start="${b.attrs.start}"`
          : '';
      const items = b.content
        .map(
          (li) =>
            `<li>${(li.content ?? []).map((p) => renderInline(p.content as Inline[] | undefined)).join('<br>')}</li>`,
        )
        .join('');
      return `<${tag}${start}>${items}</${tag}>`;
    }
    case 'blockquote':
      return `<blockquote>${b.content.map((p) => `<p>${renderInline(p.content as Inline[] | undefined)}</p>`).join('')}</blockquote>`;
  }
}

/** HTML for a validated rich-text document. Every text node is escaped; only known tags are emitted. */
export function renderRichText(doc: RichTextDoc): string {
  return doc.content.map(renderBlock).join('');
}
