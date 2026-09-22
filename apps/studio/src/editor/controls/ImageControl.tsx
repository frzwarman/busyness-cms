import type { ImageRef } from '@siteos/schemas';
import { AlertTriangle, ImagePlus, Images, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PREVIEW_ORIGIN } from '@/lib/preview-bridge';
import { imageRefFromAsset } from '../assets/AssetLibrary';
import { AssetPickerDialog } from '../assets/AssetPickerDialog';

/**
 * Image reference editor: URL, alt text, decorative flag, focal point.
 * The asset library (upload, variants, usage) plugs in here in Milestone 5.
 */
export function ImageControl({
  id,
  value,
  onChange,
}: {
  id: string;
  value: ImageRef | null;
  onChange: (v: ImageRef | null) => void;
}) {
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const picker = (
    <AssetPickerDialog
      open={pickerOpen}
      onOpenChange={setPickerOpen}
      onPick={(a) => onChange(imageRefFromAsset(a))}
    />
  );
  if (!value) {
    return (
      <>
        <Button
          id={id}
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => setPickerOpen(true)}
        >
          <ImagePlus data-icon="inline-start" /> Choose image
        </Button>
        {picker}
      </>
    );
  }
  const src = value.src.startsWith('/') ? `${PREVIEW_ORIGIN}${value.src}` : value.src;
  const altMissing = !value.decorative && value.alt.trim() === '';

  const setFocal = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    onChange({
      ...value,
      focalX: round((e.clientX - r.left) / r.width),
      focalY: round((e.clientY - r.top) / r.height),
    });
  };
  const nudge = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const step = 0.05;
    const map: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const d = map[e.key];
    if (!d) return;
    e.preventDefault();
    onChange({ ...value, focalX: clamp(value.focalX + d[0]), focalY: clamp(value.focalY + d[1]) });
  };

  return (
    <div className="grid gap-2.5 rounded-md border p-2.5">
      <button
        type="button"
        onClick={setFocal}
        onKeyDown={nudge}
        className="relative aspect-[4/3] w-full overflow-hidden rounded bg-muted focus-visible:outline-2 focus-visible:outline-ring"
        aria-label={`Focal point at ${Math.round(value.focalX * 100)}% across, ${Math.round(value.focalY * 100)}% down. Click or use arrow keys to move it.`}
      >
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          style={{ objectPosition: `${value.focalX * 100}% ${value.focalY * 100}%` }}
          onLoad={(e) =>
            setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })
          }
        />
        <span
          className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary/80 shadow"
          style={{ left: `${value.focalX * 100}%`, top: `${value.focalY * 100}%` }}
        />
      </button>
      <p className="text-[11px] text-muted-foreground">
        Click the image to set the focal point that stays visible when it is cropped.
        {natural && ` ${natural.w} × ${natural.h}px`}
      </p>
      <Button
        variant="outline"
        size="sm"
        className="justify-start"
        onClick={() => setPickerOpen(true)}
      >
        <Images data-icon="inline-start" /> Replace from library
      </Button>
      {picker}
      <div className="grid gap-1.5">
        <Label htmlFor={`${id}-src`} className="text-xs">
          Image URL
        </Label>
        <Input
          id={`${id}-src`}
          value={value.src}
          onChange={(e) => onChange({ ...value, src: e.target.value })}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={id} className="text-xs">
          Alt text
        </Label>
        <Input
          id={id}
          value={value.alt}
          maxLength={300}
          disabled={value.decorative}
          onChange={(e) => onChange({ ...value, alt: e.target.value })}
          placeholder="Describe what the image shows"
          aria-describedby={altMissing ? `${id}-warn` : undefined}
        />
        {altMissing && (
          <p
            id={`${id}-warn`}
            className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400"
          >
            <AlertTriangle className="size-3" /> Missing alt text. Describe the image, or mark it
            decorative.
          </p>
        )}
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor={`${id}-decorative`} className="text-xs font-normal">
          Decorative (no alt text needed)
        </Label>
        <Switch
          id={`${id}-decorative`}
          checked={value.decorative}
          onCheckedChange={(decorative) => onChange({ ...value, decorative })}
        />
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="justify-start text-muted-foreground"
        onClick={() => onChange(null)}
      >
        <Trash2 data-icon="inline-start" /> Remove image
      </Button>
    </div>
  );
}

const clamp = (n: number) => Math.min(1, Math.max(0, n));
const round = (n: number) => Math.round(clamp(n) * 100) / 100;
