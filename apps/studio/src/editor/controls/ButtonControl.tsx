import type { Button as ButtonValue } from '@siteos/schemas';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LinkControl } from './LinkControl';
import { Segmented } from './Segmented';

const styles = [
  { value: 'filled', label: 'Filled' },
  { value: 'outline', label: 'Outline' },
  { value: 'text', label: 'Text' },
];

export function ButtonControl({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: ButtonValue | null;
  onChange: (v: ButtonValue | null) => void;
}) {
  if (!value) {
    return (
      <Button
        id={id}
        variant="outline"
        size="sm"
        className="w-full justify-start"
        onClick={() =>
          onChange({
            label: 'Learn more',
            link: { kind: 'anchor', anchor: 'contact' },
            style: 'filled',
          })
        }
      >
        <Plus data-icon="inline-start" /> Add {label.toLowerCase()}
      </Button>
    );
  }
  return (
    <div className="grid gap-2.5 rounded-md border p-2.5">
      <div className="grid gap-1.5">
        <Label htmlFor={id} className="text-xs">
          Label
        </Label>
        <Input
          id={id}
          value={value.label}
          maxLength={80}
          onChange={(e) => onChange({ ...value, label: e.target.value })}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={`${id}-link`} className="text-xs">
          Link
        </Label>
        <LinkControl
          id={`${id}-link`}
          value={value.link}
          onChange={(link) => onChange({ ...value, link })}
        />
      </div>
      <div className="grid gap-1.5">
        <Label className="text-xs">Style</Label>
        <Segmented
          label={`${label} style`}
          value={value.style}
          options={styles}
          onChange={(style) => onChange({ ...value, style: style as ButtonValue['style'] })}
        />
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="justify-start text-muted-foreground"
        onClick={() => onChange(null)}
      >
        <Trash2 data-icon="inline-start" /> Remove button
      </Button>
    </div>
  );
}
