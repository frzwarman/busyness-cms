import type { Link } from '@siteos/schemas';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useEditor } from '../EditorProvider';

const kinds: Array<{ value: Link['kind']; label: string }> = [
  { value: 'page', label: 'Page on this site' },
  { value: 'url', label: 'External URL' },
  { value: 'email', label: 'Email address' },
  { value: 'phone', label: 'Phone number' },
  { value: 'anchor', label: 'Section on this page' },
];

function defaultFor(kind: Link['kind'], firstPageId: string): Link {
  switch (kind) {
    case 'page':
      return { kind, pageId: firstPageId };
    case 'url':
      return { kind, href: 'https://', newTab: false };
    case 'email':
      return { kind, email: '' };
    case 'phone':
      return { kind, phone: '' };
    case 'anchor':
      return { kind, anchor: '' };
  }
}

/** Typed link editor. Internal links store page ids so slug changes never break them. */
export function LinkControl({
  id,
  value,
  onChange,
}: {
  id: string;
  value: Link;
  onChange: (l: Link) => void;
}) {
  const { pages } = useEditor();
  return (
    <div className="grid gap-2">
      <Select
        value={value.kind}
        onValueChange={(k) => onChange(defaultFor(k as Link['kind'], pages[0]?.id ?? ''))}
      >
        <SelectTrigger id={id} aria-label="Link type" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {kinds.map((k) => (
            <SelectItem key={k.value} value={k.value}>
              {k.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value.kind === 'page' && (
        <Select value={value.pageId} onValueChange={(pageId) => onChange({ ...value, pageId })}>
          <SelectTrigger aria-label="Target page" className="w-full">
            <SelectValue placeholder="Choose a page" />
          </SelectTrigger>
          <SelectContent>
            {pages.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.title} <span className="text-muted-foreground">{p.slug}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {value.kind === 'url' && (
        <>
          <Input
            type="url"
            inputMode="url"
            value={value.href}
            onChange={(e) => onChange({ ...value, href: e.target.value })}
            placeholder="https://example.com"
            aria-label="URL"
          />
          <div className="flex items-center justify-between">
            <Label htmlFor={`${id}-newtab`} className="text-xs font-normal">
              Open in new tab
            </Label>
            <Switch
              id={`${id}-newtab`}
              checked={value.newTab}
              onCheckedChange={(newTab) => onChange({ ...value, newTab })}
            />
          </div>
        </>
      )}
      {value.kind === 'email' && (
        <Input
          type="email"
          value={value.email}
          onChange={(e) => onChange({ ...value, email: e.target.value })}
          placeholder="hello@example.com"
          aria-label="Email address"
        />
      )}
      {value.kind === 'phone' && (
        <Input
          type="tel"
          value={value.phone}
          onChange={(e) => onChange({ ...value, phone: e.target.value })}
          placeholder="+62 21 555 0100"
          aria-label="Phone number"
        />
      )}
      {value.kind === 'anchor' && (
        <Input
          value={value.anchor}
          onChange={(e) => onChange({ ...value, anchor: e.target.value.replace(/^#/, '') })}
          placeholder="contact"
          aria-label="Section id"
        />
      )}
    </div>
  );
}
