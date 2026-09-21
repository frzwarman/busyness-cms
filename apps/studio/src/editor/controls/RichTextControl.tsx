import { emptyRichText, type RichTextDoc, richTextDocSchema } from '@siteos/sections';
import Link from '@tiptap/extension-link';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Heading2, Heading3, Italic, Link2, List, ListOrdered, Quote } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Constrained Tiptap editor. Its output is validated against the shared rich-text schema before it is
 * stored, so the renderer only ever sees known nodes. No raw HTML in, no raw HTML out.
 */
export function RichTextControl({
  id,
  value,
  onChange,
}: {
  id: string;
  value: RichTextDoc;
  onChange: (v: RichTextDoc) => void;
}) {
  const lastEmitted = useRef<string>(JSON.stringify(value));
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        underline: false,
        dropcursor: false,
        gapcursor: false,
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        protocols: ['http', 'https', 'mailto', 'tel'],
        HTMLAttributes: { rel: null, target: null },
      }),
    ],
    content: value.content.length ? value : emptyRichText,
    editorProps: {
      attributes: {
        id,
        class:
          'min-h-28 rounded-md border bg-background px-3 py-2 text-sm focus:outline-2 focus:outline-ring',
        role: 'textbox',
        'aria-multiline': 'true',
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const parsed = richTextDocSchema.safeParse(json);
      if (!parsed.success) return; // an unsupported node slipped in (e.g. paste); the last valid value stands
      const s = JSON.stringify(parsed.data);
      if (s === lastEmitted.current) return;
      lastEmitted.current = s;
      onChange(parsed.data);
    },
  });

  // External changes (undo/redo, restore) flow back into the editor without echoing an onChange.
  useEffect(() => {
    if (!editor) return;
    const s = JSON.stringify(value);
    if (s !== lastEmitted.current) {
      lastEmitted.current = s;
      editor.commands.setContent(value.content.length ? value : emptyRichText, {
        emitUpdate: false,
      });
    }
  }, [editor, value]);

  if (!editor) return null;
  const tb = (label: string, active: boolean, onClick: () => void, Icon: typeof Bold) => (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className={cn('size-7', active && 'bg-muted')}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      <Icon />
    </Button>
  );
  const setLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const href = window.prompt('Link URL (https://, mailto:, tel:)', prev ?? 'https://');
    if (href === null) return;
    if (href === '') return void editor.chain().focus().unsetLink().run();
    if (!/^(https?:\/\/|mailto:|tel:|\/|#)/.test(href))
      return window.alert('Use a link starting with https://, mailto:, tel:, / or #.');
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  };
  return (
    <div className="grid gap-1.5">
      <div
        className="flex flex-wrap items-center gap-0.5 rounded-md border bg-muted/40 p-0.5"
        role="toolbar"
        aria-label="Formatting"
      >
        {tb('Bold', editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), Bold)}
        {tb(
          'Italic',
          editor.isActive('italic'),
          () => editor.chain().focus().toggleItalic().run(),
          Italic,
        )}
        {tb(
          'Large heading',
          editor.isActive('heading', { level: 2 }),
          () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          Heading2,
        )}
        {tb(
          'Small heading',
          editor.isActive('heading', { level: 3 }),
          () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
          Heading3,
        )}
        {tb(
          'Bullet list',
          editor.isActive('bulletList'),
          () => editor.chain().focus().toggleBulletList().run(),
          List,
        )}
        {tb(
          'Numbered list',
          editor.isActive('orderedList'),
          () => editor.chain().focus().toggleOrderedList().run(),
          ListOrdered,
        )}
        {tb(
          'Quote',
          editor.isActive('blockquote'),
          () => editor.chain().focus().toggleBlockquote().run(),
          Quote,
        )}
        {tb('Link', editor.isActive('link'), setLink, Link2)}
      </div>
      <EditorContent editor={editor} className="rich-text-editor" />
    </div>
  );
}
