import { getPath } from '@siteos/editor-core';
import type { Button as ButtonValue, ImageRef, Link, SectionInstance } from '@siteos/schemas';
import {
  type InspectorField,
  type InspectorGroup,
  registry,
  type SectionDefinition,
} from '@siteos/sections';
import { Copy, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ButtonControl } from './controls/ButtonControl';
import { fieldId } from './controls/field-id';
import { ImageControl } from './controls/ImageControl';
import { LinkControl } from './controls/LinkControl';
import { Segmented } from './controls/Segmented';
import { useEditor, useSelectedSection } from './EditorProvider';
import { Thumbnail } from './Thumbnail';

const themeOptions = [
  { value: 'light', label: 'Light' },
  { value: 'surface', label: 'Surface' },
  { value: 'dark', label: 'Dark' },
  { value: 'brand', label: 'Brand' },
];
const spacingOptions = [
  { value: 'none', label: 'None' },
  { value: 'compact', label: 'Compact' },
  { value: 'standard', label: 'Standard' },
  { value: 'large', label: 'Large' },
];

export function Inspector() {
  const section = useSelectedSection();
  const { state, dispatch, focusRequest } = useEditor();

  // Click-to-select from the preview / navigator: focus the matching field.
  useEffect(() => {
    if (!focusRequest || focusRequest.sectionId !== section?.id) return;
    const path = focusRequest.fieldPath;
    const el = path ? document.getElementById(fieldId(section.id, path)) : null;
    const target = el ?? document.getElementById(`inspector-${section.id}`);
    target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    if (el && 'focus' in el) (el as HTMLElement).focus({ preventScroll: true });
  }, [focusRequest, section?.id]);

  if (!section) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center text-sm text-muted-foreground">
        <p>
          {state.document.sections.length === 0
            ? 'Add a section to start editing.'
            : 'Select a section in the preview or the list to edit it.'}
        </p>
      </div>
    );
  }
  const def = registry.get(section.type);
  const validation = registry.validate(section);
  if (!def) {
    return (
      <div className="p-4 text-sm">
        <h2 className="font-semibold">Unknown section “{section.type}”</h2>
        <p className="mt-2 text-muted-foreground">
          This build does not know how to edit this section. It is kept in your draft untouched.
        </p>
        <Button
          variant="destructive"
          size="sm"
          className="mt-4"
          onClick={() => dispatch({ type: 'removeSection', sectionId: section.id })}
        >
          <Trash2 data-icon="inline-start" /> Remove section
        </Button>
      </div>
    );
  }
  const update = (path: string, value: unknown) =>
    dispatch({ type: 'updateProps', sectionId: section.id, path, value });

  return (
    <div id={`inspector-${section.id}`} className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold">{def.title}</h2>
          <p className="truncate text-xs text-muted-foreground">{def.description}</p>
        </div>
        <div className="flex shrink-0 items-center">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Duplicate section"
            onClick={() => dispatch({ type: 'duplicateSection', sectionId: section.id })}
          >
            <Copy />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label={section.hidden ? 'Show section' : 'Hide section'}
            aria-pressed={section.hidden}
            onClick={() => dispatch({ type: 'toggleHidden', sectionId: section.id })}
          >
            {section.hidden ? <EyeOff /> : <Eye />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-destructive hover:text-destructive"
            aria-label="Delete section"
            onClick={() => dispatch({ type: 'removeSection', sectionId: section.id })}
          >
            <Trash2 />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {!validation.ok && (
          <div
            className="m-3 rounded-md border border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
            role="alert"
          >
            <strong>This section has invalid content and will not publish.</strong>
            <ul className="mt-1 list-disc pl-4">
              {validation.errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}
        <Group label="Layout & style">
          <Field label="Layout">
            <ul className="grid grid-cols-2 gap-2" aria-label="Section layout">
              {def.variants.map((v) => (
                <li key={v.value}>
                  <button
                    type="button"
                    onClick={() =>
                      dispatch({ type: 'setVariant', sectionId: section.id, variant: v.value })
                    }
                    aria-pressed={section.props.variant === v.value}
                    className={cn(
                      'w-full rounded-md border p-1.5 text-left hover:bg-muted',
                      section.props.variant === v.value &&
                        'border-foreground ring-1 ring-foreground',
                    )}
                  >
                    <Thumbnail wire={v.thumbnail} className="p-1.5" />
                    <span className="mt-1 block truncate text-xs">{v.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Field>
          {def.capabilities.theme && (
            <Field label="Theme" htmlFor={fieldId(section.id, 'theme')}>
              <Segmented
                id={fieldId(section.id, 'theme')}
                label="Section theme"
                value={String(section.props.theme ?? 'light')}
                options={themeOptions}
                onChange={(v) => update('theme', v)}
              />
            </Field>
          )}
          {def.capabilities.spacing && (
            <Field label="Spacing" htmlFor={fieldId(section.id, 'spacing')}>
              <Segmented
                id={fieldId(section.id, 'spacing')}
                label="Section spacing"
                value={String(section.props.spacing ?? 'standard')}
                options={spacingOptions}
                onChange={(v) => update('spacing', v)}
              />
            </Field>
          )}
        </Group>
        {def.inspector
          .filter((g) => isVisible(g, section))
          .map((g) => (
            <Group key={g.id} label={g.label}>
              {g.fields.map((f) => (
                <FieldControl
                  key={f.path}
                  field={f}
                  section={section}
                  def={def}
                  onChange={update}
                />
              ))}
            </Group>
          ))}
      </div>
    </div>
  );
}

function isVisible(g: InspectorGroup, s: SectionInstance) {
  return !g.showWhen || g.showWhen.values.includes(String(getPath(s.props, g.showWhen.path)));
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="border-b px-3 py-3">
      <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </h3>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  description,
  children,
}: {
  label: string;
  htmlFor?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor} className="text-xs">
        {label}
      </Label>
      {children}
      {description && <p className="text-[11px] text-muted-foreground">{description}</p>}
    </div>
  );
}

function FieldControl({
  field,
  section,
  onChange,
}: {
  field: InspectorField;
  section: SectionInstance;
  def: SectionDefinition;
  onChange: (path: string, value: unknown) => void;
}) {
  const id = fieldId(section.id, field.path);
  const value = getPath(section.props, field.path);
  // Composite controls (image, button, link) carry their own labelled inputs; a <label for> pointing at
  // their container button would override its visible text as the accessible name.
  const composite =
    field.control === 'image' || field.control === 'button' || field.control === 'link';
  const common = {
    label: field.label,
    htmlFor: composite ? undefined : id,
    description: field.description,
  };
  switch (field.control) {
    case 'text':
      return (
        <Field {...common}>
          <Input
            id={id}
            value={String(value ?? '')}
            maxLength={field.maxLength}
            placeholder={field.placeholder}
            onChange={(e) => onChange(field.path, e.target.value)}
          />
        </Field>
      );
    case 'textarea':
      return (
        <Field {...common}>
          <Textarea
            id={id}
            value={String(value ?? '')}
            rows={field.rows ?? 3}
            maxLength={field.maxLength}
            onChange={(e) => onChange(field.path, e.target.value)}
          />
        </Field>
      );
    case 'select':
      return (
        <Field {...common}>
          <Select value={String(value ?? '')} onValueChange={(v) => onChange(field.path, v)}>
            <SelectTrigger id={id} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      );
    case 'segmented':
      return (
        <Field {...common}>
          <Segmented
            id={id}
            label={field.label}
            value={String(value ?? '')}
            options={field.options}
            onChange={(v) => onChange(field.path, v)}
          />
        </Field>
      );
    case 'toggle':
      return (
        <div className="flex items-center justify-between">
          <Label htmlFor={id} className="text-xs font-normal">
            {field.label}
          </Label>
          <Switch
            id={id}
            checked={Boolean(value)}
            onCheckedChange={(v) => onChange(field.path, v)}
          />
        </div>
      );
    case 'image':
      return (
        <Field {...common}>
          <ImageControl
            id={id}
            value={(value as ImageRef | null) ?? null}
            onChange={(v) => onChange(field.path, v)}
          />
        </Field>
      );
    case 'button':
      return (
        <Field {...common}>
          <ButtonControl
            id={id}
            label={field.label}
            value={(value as ButtonValue | null) ?? null}
            onChange={(v) => onChange(field.path, v)}
          />
        </Field>
      );
    case 'link':
      return (
        <Field {...common}>
          <LinkControl id={id} value={value as Link} onChange={(v) => onChange(field.path, v)} />
        </Field>
      );
  }
}
