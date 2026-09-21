import type { SelectOption } from '@siteos/sections';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export function Segmented({
  id,
  value,
  options,
  onChange,
  label,
}: {
  id?: string;
  value: string;
  options: SelectOption[];
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <ToggleGroup
      id={id}
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v)}
      variant="outline"
      size="sm"
      className="w-full *:flex-1"
      aria-label={label}
    >
      {options.map((o) => (
        <ToggleGroupItem key={o.value} value={o.value} className="text-xs">
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
