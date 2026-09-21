import { fontStacks, themePresets, themeWarnings } from '@siteos/design-system';
import { fontIds, type ThemeTokens } from '@siteos/schemas';
import { AlertTriangle, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Segmented } from './controls/Segmented';
import { useEditor } from './EditorProvider';

const colorLabels: Record<keyof ThemeTokens['colors'], string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  accent: 'Accent',
  background: 'Background',
  surface: 'Surface',
  text: 'Text',
  muted: 'Muted text',
};

/** Site-wide design tokens. Changing a preset preserves all page content; only tokens change. */
export function BrandPanel() {
  const { theme, setTheme } = useEditor();
  const warnings = themeWarnings(theme);
  const set = <K extends keyof ThemeTokens>(group: K, patch: Partial<ThemeTokens[K]>) =>
    setTheme({ ...theme, [group]: { ...theme[group], ...patch } });
  const activePreset = themePresets.find(
    (p) => JSON.stringify(p.tokens) === JSON.stringify(theme),
  )?.id;

  return (
    <div className="flex h-full flex-col overflow-auto">
      <Section title="Theme preset">
        <ul className="grid grid-cols-2 gap-2">
          {themePresets.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setTheme(p.tokens)}
                aria-pressed={activePreset === p.id}
                className={cn(
                  'w-full rounded-md border p-2 text-left hover:bg-muted',
                  activePreset === p.id && 'border-foreground ring-1 ring-foreground',
                )}
              >
                <span className="mb-1.5 flex gap-1">
                  {(['primary', 'accent', 'background', 'text'] as const).map((k) => (
                    <span
                      key={k}
                      className="size-4 rounded-full border"
                      style={{ background: p.tokens.colors[k] }}
                    />
                  ))}
                </span>
                <span className="block text-xs font-medium">{p.name}</span>
                <span className="line-clamp-2 block text-[11px] text-muted-foreground">
                  {p.description}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Colors">
        {(Object.keys(colorLabels) as Array<keyof ThemeTokens['colors']>).map((k) => (
          <div key={k} className="flex items-center gap-2">
            <input
              type="color"
              value={theme.colors[k]}
              onChange={(e) => set('colors', { [k]: e.target.value })}
              aria-label={`${colorLabels[k]} color`}
              className="size-8 shrink-0 cursor-pointer rounded border bg-transparent p-0.5"
            />
            <Label htmlFor={`color-${k}`} className="w-24 text-xs">
              {colorLabels[k]}
            </Label>
            <Input
              id={`color-${k}`}
              value={theme.colors[k]}
              onChange={(e) =>
                /^#[0-9a-fA-F]{6}$/.test(e.target.value) && set('colors', { [k]: e.target.value })
              }
              defaultValue={undefined}
              className="h-8 font-mono text-xs"
            />
          </div>
        ))}
        {warnings.length > 0 ? (
          <ul className="rounded-md border border-amber-300 bg-amber-50 p-2 text-[11px] text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
            {warnings.map((w) => (
              <li key={w.pair} className="flex gap-1.5">
                <AlertTriangle className="mt-0.5 size-3 shrink-0" /> {w.message}
              </li>
            ))}
          </ul>
        ) : (
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Check className="size-3" /> Core text and button colors meet WCAG AA contrast.
          </p>
        )}
      </Section>
      <Section title="Typography">
        <FontSelect
          id="font-heading"
          label="Heading font"
          value={theme.typography.headingFont}
          onChange={(v) => set('typography', { headingFont: v })}
        />
        <FontSelect
          id="font-body"
          label="Body font"
          value={theme.typography.bodyFont}
          onChange={(v) => set('typography', { bodyFont: v })}
        />
        <Labeled label="Base size">
          <Segmented
            label="Base size"
            value={theme.typography.baseSize}
            options={[
              { value: 'sm', label: 'Small' },
              { value: 'md', label: 'Medium' },
              { value: 'lg', label: 'Large' },
            ]}
            onChange={(v) =>
              set('typography', { baseSize: v as ThemeTokens['typography']['baseSize'] })
            }
          />
        </Labeled>
        <Labeled label="Heading scale">
          <Segmented
            label="Heading scale"
            value={theme.typography.headingScale}
            options={[
              { value: 'compact', label: 'Compact' },
              { value: 'standard', label: 'Standard' },
              { value: 'dramatic', label: 'Dramatic' },
            ]}
            onChange={(v) =>
              set('typography', { headingScale: v as ThemeTokens['typography']['headingScale'] })
            }
          />
        </Labeled>
        <Labeled label="Heading weight">
          <Segmented
            label="Heading weight"
            value={theme.typography.headingWeight}
            options={[
              { value: 'medium', label: 'Medium' },
              { value: 'semibold', label: 'Semibold' },
              { value: 'bold', label: 'Bold' },
            ]}
            onChange={(v) =>
              set('typography', { headingWeight: v as ThemeTokens['typography']['headingWeight'] })
            }
          />
        </Labeled>
      </Section>
      <Section title="Shape">
        <Labeled label="Corner radius">
          <Segmented
            label="Corner radius"
            value={theme.shape.radius}
            options={[
              { value: 'none', label: 'None' },
              { value: 'sm', label: 'S' },
              { value: 'md', label: 'M' },
              { value: 'lg', label: 'L' },
              { value: 'full', label: 'Pill' },
            ]}
            onChange={(v) => set('shape', { radius: v as ThemeTokens['shape']['radius'] })}
          />
        </Labeled>
        <Labeled label="Default button style">
          <Segmented
            label="Default button style"
            value={theme.shape.buttonStyle}
            options={[
              { value: 'filled', label: 'Filled' },
              { value: 'outline', label: 'Outline' },
              { value: 'text', label: 'Text' },
            ]}
            onChange={(v) =>
              set('shape', { buttonStyle: v as ThemeTokens['shape']['buttonStyle'] })
            }
          />
        </Labeled>
      </Section>
      <Section title="Layout">
        <Labeled label="Content width">
          <Segmented
            label="Content width"
            value={theme.layout.contentWidth}
            options={[
              { value: 'narrow', label: 'Narrow' },
              { value: 'standard', label: 'Standard' },
              { value: 'wide', label: 'Wide' },
            ]}
            onChange={(v) =>
              set('layout', { contentWidth: v as ThemeTokens['layout']['contentWidth'] })
            }
          />
        </Labeled>
        <Labeled label="Section spacing">
          <Segmented
            label="Section spacing"
            value={theme.layout.sectionSpacing}
            options={[
              { value: 'compact', label: 'Compact' },
              { value: 'standard', label: 'Standard' },
              { value: 'airy', label: 'Airy' },
            ]}
            onChange={(v) =>
              set('layout', { sectionSpacing: v as ThemeTokens['layout']['sectionSpacing'] })
            }
          />
        </Labeled>
        <Labeled label="Card spacing">
          <Segmented
            label="Card spacing"
            value={theme.layout.cardSpacing}
            options={[
              { value: 'compact', label: 'Compact' },
              { value: 'standard', label: 'Standard' },
              { value: 'airy', label: 'Airy' },
            ]}
            onChange={(v) =>
              set('layout', { cardSpacing: v as ThemeTokens['layout']['cardSpacing'] })
            }
          />
        </Labeled>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b px-3 py-3">
      <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="grid gap-2.5">{children}</div>
    </section>
  );
}
function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
function FontSelect({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: ThemeTokens['typography']['headingFont'];
  onChange: (v: ThemeTokens['typography']['headingFont']) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <Select
        value={value}
        onValueChange={(v) => onChange(v as ThemeTokens['typography']['headingFont'])}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {fontIds.map((f) => (
            <SelectItem key={f} value={f}>
              <span style={{ fontFamily: fontStacks[f].stack }}>{fontStacks[f].label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
