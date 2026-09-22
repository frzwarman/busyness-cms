import { getPath } from '@siteos/editor-core';
import type { Button as ButtonValue, ImageRef, Link, SectionInstance } from '@siteos/schemas';
import {
  type ContentSource,
  type IconName,
  type InspectorField,
  type InspectorGroup,
  manualSource,
  type RichTextDoc,
  registry,
  type SectionDefinition,
} from '@siteos/sections';
import { Copy, Eye, EyeOff, Globe, Trash2, Unlink } from 'lucide-react';
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
import { useGlobalEditor } from './content/content-queries';
import { ButtonControl } from './controls/ButtonControl';
import { ContentSourceControl } from './controls/ContentSourceControl';
import { FormPicker } from './controls/FormPicker';
import { fieldId } from './controls/field-id';
import { IconControl } from './controls/IconControl';
import { ImageControl } from './controls/ImageControl';
import { LinkControl } from './controls/LinkControl';
import { ListControl } from './controls/ListControl';
import { RichTextControl } from './controls/RichTextControl';
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
  const selected = useSelectedSection();
  const { state, dispatch, focusRequest, canEdit } = useEditor();
  const g = useGlobalEditor(selected?.globalId);

  // Click-to-select from the preview / navigator: focus the matching field.
  useEffect(() => {
    if (!focusRequest || focusRequest.sectionId !== selected?.id) return;
    const path = focusRequest.fieldPath;
    const el = path ? document.getElementById(fieldId(selected.id, path)) : null;
    const target = el ?? document.getElementById(`inspector-${selected.id}`);
    target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    if (el && 'focus' in el) (el as HTMLElement).focus({ preventScroll: true });
  }, [focusRequest, selected?.id]);

  if (!selected) {
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

  // A global-linked section edits the global's content (shared), not the page's placeholder.
  const isGlobal = Boolean(selected.globalId);
  const missingGlobal = isGlobal && g.global === null;
  const section: SectionInstance =
    isGlobal && g.global
      ? {
          ...selected,
          type: g.global.section.type,
          schemaVersion: g.global.section.schemaVersion,
          props: g.props,
        }
      : selected;
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
    isGlobal
      ? g.update(path, value)
      : dispatch({ type: 'updateProps', sectionId: section.id, path, value });
  const setVariant = (variant: string) =>
    isGlobal
      ? g.setVariant(variant)
      : dispatch({ type: 'setVariant', sectionId: section.id, variant });

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
        {isGlobal && (
          <div className="m-3 rounded-md border bg-muted/40 p-2.5 text-xs" role="status">
            <p className="flex items-center gap-1.5 font-medium">
              <Globe className="size-3.5" /> Global section{g.global ? ` · ${g.global.name}` : ''}
            </p>
            {missingGlobal ? (
              <p className="mt-1 text-destructive">
                This global section was deleted. Detach to keep a local copy, or remove the section.
              </p>
            ) : (
              <p className="mt-1 text-muted-foreground">
                Changes here apply to every page using it on their next publish.{' '}
                {g.status === 'saving'
                  ? 'Saving…'
                  : g.status === 'saved'
                    ? 'Saved.'
                    : g.status === 'conflict'
                      ? 'Changed elsewhere — reload to continue.'
                      : g.status === 'error'
                        ? 'Failed to save.'
                        : ''}
              </p>
            )}
            {canEdit && (
              <Button
                size="xs"
                variant="outline"
                className="mt-2"
                onClick={() =>
                  dispatch({
                    type: 'detachGlobal',
                    sectionId: selected.id,
                    content: {
                      type: section.type,
                      schemaVersion: section.schemaVersion,
                      props: section.props,
                    },
                  })
                }
              >
                <Unlink /> Detach from global
              </Button>
            )}
          </div>
        )}
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
                    onClick={() => setVariant(v.value)}
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
          .filter((grp) => isVisible(grp, section))
          .map((grp) => (
            <Group key={grp.id} label={grp.label}>
              {grp.fields.map((f) => (
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
  def,
  onChange,
}: {
  field: InspectorField;
  section: SectionInstance;
  def: SectionDefinition;
  onChange: (path: string, value: unknown) => void;
}) {
  const id = fieldId(section.id, field.path);
  const value = getPath(section.props, field.path);
  const composite =
    field.control === 'image' ||
    field.control === 'button' ||
    field.control === 'link' ||
    field.control === 'list' ||
    field.control === 'richtext' ||
    field.control === 'icon' ||
    field.control === 'content-source';
  if (field.control === 'toggle') {
    return (
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-xs font-normal">
          {field.label}
        </Label>
        <Switch id={id} checked={Boolean(value)} onCheckedChange={(v) => onChange(field.path, v)} />
      </div>
    );
  }
  return (
    <Field label={field.label} htmlFor={composite ? undefined : id} description={field.description}>
      {renderControl(field, value, (v) => onChange(field.path, v), id, {
        collectionId: def.collection?.id,
      })}
    </Field>
  );
}

/** Controls that carry their own labelled inputs; a <label for> on their container would mislabel them. */
export const isCompositeControl = (control: InspectorField['control']) =>
  control === 'image' ||
  control === 'button' ||
  control === 'link' ||
  control === 'list' ||
  control === 'richtext' ||
  control === 'icon' ||
  control === 'content-source' ||
  control === 'form-picker';

/** One control for one field value. Shared by top-level fields and list items (recursively). */
export function renderControl(
  field: InspectorField,
  value: unknown,
  onChange: (v: unknown) => void,
  id: string,
  ctx: { collectionId?: string } = {},
): React.ReactNode {
  switch (field.control) {
    case 'form-picker':
      return (
        <FormPicker
          id={id}
          value={(value as string | null) ?? null}
          onChange={(v) => onChange(v)}
        />
      );
    case 'content-source':
      return ctx.collectionId ? (
        <ContentSourceControl
          id={id}
          collectionId={ctx.collectionId}
          value={(value as ContentSource | undefined) ?? manualSource}
          onChange={(v) => onChange(v)}
        />
      ) : null;
    case 'text':
      return (
        <Input
          id={id}
          value={String(value ?? '')}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'textarea':
      return (
        <Textarea
          id={id}
          value={String(value ?? '')}
          rows={field.rows ?? 3}
          maxLength={field.maxLength}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'number':
      return (
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          value={value === undefined || value === null ? '' : String(value)}
          min={field.min}
          max={field.max}
          step={field.step}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        />
      );
    case 'select':
      return (
        <Select value={String(value ?? '')} onValueChange={(v) => onChange(v)}>
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
      );
    case 'segmented':
      return (
        <Segmented
          id={id}
          label={field.label}
          value={String(value ?? '')}
          options={field.options}
          onChange={(v) => onChange(v)}
        />
      );
    case 'toggle':
      return (
        <Switch
          id={id}
          checked={Boolean(value)}
          onCheckedChange={(v) => onChange(v)}
          aria-label={field.label}
        />
      );
    case 'image':
      return (
        <ImageControl
          id={id}
          value={(value as ImageRef | null) ?? null}
          onChange={(v) => onChange(v)}
        />
      );
    case 'button':
      return (
        <ButtonControl
          id={id}
          label={field.label}
          value={(value as ButtonValue | null) ?? null}
          onChange={(v) => onChange(v)}
        />
      );
    case 'link':
      return value ? (
        <LinkControl id={id} value={value as Link} onChange={(v) => onChange(v)} />
      ) : (
        <Button
          id={id}
          variant="outline"
          size="sm"
          className="justify-start"
          onClick={() => onChange({ kind: 'anchor', anchor: 'main' })}
        >
          Add link
        </Button>
      );
    case 'icon':
      return (
        <IconControl
          id={id}
          value={(value as IconName | null) ?? null}
          onChange={(v) => onChange(v)}
        />
      );
    case 'richtext':
      return (
        <RichTextControl
          id={id}
          value={(value as RichTextDoc | undefined) ?? { type: 'doc', content: [] }}
          onChange={(v) => onChange(v)}
        />
      );
    case 'list':
      return (
        <ListControl
          id={id}
          label={field.label}
          items={Array.isArray(value) ? (value as Array<Record<string, unknown> | string>) : []}
          itemLabel={field.itemLabel}
          fields={field.fields}
          titlePath={field.titlePath}
          max={field.max}
          newItem={field.newItem}
          onChange={(items) => onChange(items)}
          renderField={renderControl}
        />
      );
  }
}
