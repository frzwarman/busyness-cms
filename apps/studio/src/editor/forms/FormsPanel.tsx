import {
  createForm,
  deleteForm,
  deleteSubmission,
  type FormRow,
  type Submission,
  setSubmissionStatus,
  submissionsToCsv,
  updateForm,
} from '@siteos/db';
import {
  type FormDefinition,
  type FormField,
  formDefinitionSchema,
  formFieldTypes,
  formTemplates,
} from '@siteos/schemas';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Download,
  Loader2,
  Mail,
  MailOpen,
  Plus,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useEditor } from '../EditorProvider';
import { relativeTime } from '../publish-queries';
import { formsQuery, submissionsQuery } from '../site/site-queries';

/** Forms tool: build forms from templates and read submissions. Nothing here needs a third-party service. */
export function FormsPanel() {
  return (
    <Tabs defaultValue="inbox" className="flex h-full flex-col gap-0">
      <TabsList className="m-2 grid grid-cols-2">
        <TabsTrigger value="inbox">Inbox</TabsTrigger>
        <TabsTrigger value="forms">Forms</TabsTrigger>
      </TabsList>
      <TabsContent value="inbox" className="min-h-0 flex-1 overflow-auto">
        <Inbox />
      </TabsContent>
      <TabsContent value="forms" className="min-h-0 flex-1 overflow-auto">
        <FormBuilder />
      </TabsContent>
    </Tabs>
  );
}

function FormBuilder() {
  const { siteId, canEdit } = useEditor();
  const qc = useQueryClient();
  const { data: forms } = useQuery(formsQuery(siteId));
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const invalidate = () => qc.invalidateQueries({ queryKey: ['forms', siteId] });

  const fromTemplate = async (templateId: string) => {
    const t = formTemplates.find((x) => x.id === templateId);
    if (!t) return;
    setError(null);
    try {
      const id = await createForm(supabase, siteId, {
        name: t.name,
        fields: t.fields,
        settings: {
          submitLabel: t.submitLabel,
          successMessage: 'Thanks, we received your message and will reply soon.',
        },
      });
      await invalidate();
      setOpen(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create form');
    }
  };

  return (
    <div className="grid gap-3 p-3">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Forms
        </h2>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Add a form here, then place it on a page with the Form section.
        </p>
      </div>
      {canEdit && (
        <Select onValueChange={(v) => void fromTemplate(v)} value="">
          <SelectTrigger className="w-full" aria-label="New form from template">
            <SelectValue placeholder="New form from template…" />
          </SelectTrigger>
          <SelectContent>
            {formTemplates.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name} <span className="text-muted-foreground">· {t.fields.length} fields</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      <ul className="grid gap-1" aria-label="Forms">
        {(forms ?? []).length === 0 && (
          <li className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
            No forms yet. Start from a template above.
          </li>
        )}
        {(forms ?? []).map((f) => (
          <FormRowEditor
            key={f.id}
            form={f}
            open={open === f.id}
            onToggle={() => setOpen(open === f.id ? null : f.id)}
            canEdit={canEdit}
            onChanged={invalidate}
          />
        ))}
      </ul>
    </div>
  );
}

function FormRowEditor({
  form,
  open,
  onToggle,
  canEdit,
  onChanged,
}: {
  form: FormRow;
  open: boolean;
  onToggle: () => void;
  canEdit: boolean;
  onChanged: () => Promise<unknown>;
}) {
  const [draft, setDraft] = useState<FormDefinition>({
    id: form.id,
    name: form.name,
    fields: form.fields,
    settings: form.settings,
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [openField, setOpenField] = useState<number | null>(null);
  const valid = formDefinitionSchema.safeParse(draft);
  const dirty =
    JSON.stringify(draft) !==
    JSON.stringify({ id: form.id, name: form.name, fields: form.fields, settings: form.settings });
  // biome-ignore lint/correctness/useExhaustiveDependencies: debounced save keyed on the serialized draft
  useEffect(() => {
    if (!dirty || !canEdit || !valid.success) return;
    setStatus('saving');
    const t = setTimeout(() => {
      updateForm(supabase, valid.data)
        .then(() => onChanged())
        .then(() => setStatus('saved'))
        .catch(() => setStatus('error'));
    }, 700);
    return () => clearTimeout(t);
  }, [JSON.stringify(draft), canEdit]);

  const setField = (i: number, patch: Partial<FormField>) =>
    setDraft((d) => ({ ...d, fields: d.fields.map((f, j) => (j === i ? { ...f, ...patch } : f)) }));
  const move = (i: number, to: number) => {
    if (to < 0 || to >= draft.fields.length) return;
    const next = [...draft.fields];
    const [m] = next.splice(i, 1);
    next.splice(to, 0, m as FormField);
    setDraft((d) => ({ ...d, fields: next }));
    setOpenField(to);
  };
  const addField = () => {
    const id = `field_${draft.fields.length + 1}`;
    setDraft((d) => ({
      ...d,
      fields: [
        ...d.fields,
        { id, type: 'text', label: 'New question', required: false, placeholder: '', options: [] },
      ],
    }));
    setOpenField(draft.fields.length);
  };
  const remove = async () => {
    if (
      !window.confirm(
        `Delete the form “${form.name}” and all its submissions? Pages using it will show nothing until you pick another form.`,
      )
    )
      return;
    await deleteForm(supabase, form.id);
    await onChanged();
  };
  const fieldError = (i: number) =>
    valid.success
      ? null
      : (valid.error.issues.find((iss) => iss.path[0] === 'fields' && iss.path[1] === i)?.message ??
        null);

  return (
    <li className="rounded-md border">
      <div className="flex items-center gap-1 pr-1">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-1.5 px-2 py-1.5 text-left text-sm"
        >
          {open ? (
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
          )}
          <span className="truncate font-medium">{draft.name}</span>
          <Badge variant="secondary" className="h-4 px-1 text-[10px]">
            {draft.fields.length} fields
          </Badge>
        </button>
        {canEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-destructive"
            aria-label={`Delete form ${form.name}`}
            onClick={() => void remove()}
          >
            <Trash2 />
          </Button>
        )}
      </div>
      {open && (
        <div className="grid gap-3 border-t bg-muted/30 p-2.5">
          <div className="grid gap-1.5">
            <Label htmlFor={`form-${form.id}-name`} className="text-xs">
              Form name
            </Label>
            <Input
              id={`form-${form.id}-name`}
              value={draft.name}
              maxLength={80}
              disabled={!canEdit}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            />
          </div>
          <div className="grid gap-1.5">
            <span className="text-xs font-medium">Fields</span>
            <ol className="grid gap-1">
              {draft.fields.map((f, i) => (
                <li key={f.id} className="rounded-md border bg-background">
                  <div className="flex items-center gap-1 pr-1">
                    <button
                      type="button"
                      onClick={() => setOpenField(openField === i ? null : i)}
                      aria-expanded={openField === i}
                      className="flex min-w-0 flex-1 items-center gap-1.5 px-2 py-1.5 text-left text-xs"
                    >
                      {openField === i ? (
                        <ChevronDown className="size-3 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="size-3 shrink-0 text-muted-foreground" />
                      )}
                      <span className="truncate">{f.label}</span>
                      <span className="text-muted-foreground">
                        · {f.type}
                        {f.required ? ' · required' : ''}
                      </span>
                      {fieldError(i) && <span className="text-destructive">· fix</span>}
                    </button>
                    {canEdit && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6"
                          aria-label={`Move ${f.label} up`}
                          disabled={i === 0}
                          onClick={() => move(i, i - 1)}
                        >
                          <ChevronUp />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6"
                          aria-label={`Move ${f.label} down`}
                          disabled={i === draft.fields.length - 1}
                          onClick={() => move(i, i + 1)}
                        >
                          <ChevronDown />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6 text-muted-foreground hover:text-destructive"
                          aria-label={`Remove ${f.label}`}
                          disabled={draft.fields.length === 1}
                          onClick={() =>
                            setDraft((d) => ({ ...d, fields: d.fields.filter((_, j) => j !== i) }))
                          }
                        >
                          <Trash2 />
                        </Button>
                      </>
                    )}
                  </div>
                  {openField === i && (
                    <div className="grid gap-2.5 border-t p-2.5">
                      <div className="grid gap-1.5">
                        <Label htmlFor={`f-${form.id}-${i}-label`} className="text-xs">
                          Label
                        </Label>
                        <Input
                          id={`f-${form.id}-${i}-label`}
                          value={f.label}
                          maxLength={80}
                          onChange={(e) => setField(i, { label: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="grid gap-1.5">
                          <Label htmlFor={`f-${form.id}-${i}-type`} className="text-xs">
                            Type
                          </Label>
                          <Select
                            value={f.type}
                            onValueChange={(v) =>
                              setField(i, {
                                type: v as FormField['type'],
                                options:
                                  v === 'select' || v === 'radio'
                                    ? f.options.length
                                      ? f.options
                                      : ['Option 1', 'Option 2']
                                    : [],
                              })
                            }
                          >
                            <SelectTrigger id={`f-${form.id}-${i}-type`} className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {formFieldTypes.map((t) => (
                                <SelectItem key={t} value={t}>
                                  {t}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-1.5">
                          <Label htmlFor={`f-${form.id}-${i}-id`} className="text-xs">
                            Field id
                          </Label>
                          <Input
                            id={`f-${form.id}-${i}-id`}
                            value={f.id}
                            maxLength={40}
                            onChange={(e) =>
                              setField(i, {
                                id: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
                              })
                            }
                            className="font-mono text-xs"
                          />
                        </div>
                      </div>
                      {(f.type === 'select' || f.type === 'radio') && (
                        <div className="grid gap-1.5">
                          <Label htmlFor={`f-${form.id}-${i}-options`} className="text-xs">
                            Options (one per line)
                          </Label>
                          <textarea
                            id={`f-${form.id}-${i}-options`}
                            value={f.options.join('\n')}
                            rows={3}
                            className="rounded-md border bg-background px-2 py-1.5 text-sm"
                            onChange={(e) =>
                              setField(i, {
                                options: e.target.value
                                  .split('\n')
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                              })
                            }
                          />
                        </div>
                      )}
                      {f.type !== 'checkbox' &&
                        f.type !== 'select' &&
                        f.type !== 'radio' &&
                        f.type !== 'date' && (
                          <div className="grid gap-1.5">
                            <Label htmlFor={`f-${form.id}-${i}-ph`} className="text-xs">
                              Placeholder
                            </Label>
                            <Input
                              id={`f-${form.id}-${i}-ph`}
                              value={f.placeholder}
                              maxLength={120}
                              onChange={(e) => setField(i, { placeholder: e.target.value })}
                            />
                          </div>
                        )}
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`f-${form.id}-${i}-req`} className="text-xs font-normal">
                          Required
                        </Label>
                        <Switch
                          id={`f-${form.id}-${i}-req`}
                          checked={f.required}
                          onCheckedChange={(v) => setField(i, { required: v })}
                        />
                      </div>
                      {fieldError(i) && (
                        <p className="text-[11px] text-destructive">{fieldError(i)}</p>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ol>
            {canEdit && (
              <Button
                size="sm"
                variant="outline"
                className="justify-start"
                disabled={draft.fields.length >= 30}
                onClick={addField}
              >
                <Plus data-icon="inline-start" /> Add field
              </Button>
            )}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={`form-${form.id}-submit`} className="text-xs">
              Button label
            </Label>
            <Input
              id={`form-${form.id}-submit`}
              value={draft.settings.submitLabel}
              maxLength={40}
              disabled={!canEdit}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  settings: { ...d.settings, submitLabel: e.target.value },
                }))
              }
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={`form-${form.id}-success`} className="text-xs">
              Message after sending
            </Label>
            <Input
              id={`form-${form.id}-success`}
              value={draft.settings.successMessage}
              maxLength={300}
              disabled={!canEdit}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  settings: { ...d.settings, successMessage: e.target.value },
                }))
              }
            />
          </div>
          <p
            className={cn(
              'h-4 text-[11px] text-muted-foreground',
              status === 'error' && 'text-destructive',
            )}
            aria-live="polite"
          >
            {!valid.success
              ? 'Fix the highlighted fields to save.'
              : status === 'saving'
                ? 'Saving…'
                : status === 'saved'
                  ? 'Saved'
                  : status === 'error'
                    ? 'Failed to save'
                    : ''}
          </p>
        </div>
      )}
    </li>
  );
}

function Inbox() {
  const { siteId, canEdit } = useEditor();
  const qc = useQueryClient();
  const { data: forms } = useQuery(formsQuery(siteId));
  const [formId, setFormId] = useState<string>('all');
  const [range, setRange] = useState<'all' | '7d' | '30d'>('all');
  const since = useMemo(
    () =>
      range === 'all'
        ? undefined
        : new Date(Date.now() - (range === '7d' ? 7 : 30) * 86_400_000).toISOString(),
    [range],
  );
  const { data: rows, isLoading } = useQuery(
    submissionsQuery(siteId, formId === 'all' ? undefined : formId, since),
  );
  const [open, setOpen] = useState<string | null>(null);
  const invalidate = () => qc.invalidateQueries({ queryKey: ['submissions', siteId] });
  const formOf = (id: string) => forms?.find((f) => f.id === id);

  const openRow = async (s: Submission) => {
    setOpen(open === s.id ? null : s.id);
    if (s.status === 'new' && canEdit) {
      await setSubmissionStatus(supabase, s.id, 'read');
      await invalidate();
    }
  };
  const exportCsv = () => {
    const f = formId === 'all' ? undefined : formOf(formId);
    if (!f || !rows) return;
    const blob = new Blob([submissionsToCsv(f, rows)], { type: 'text/csv;charset=utf-8' });
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: `${f.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-submissions.csv`,
    });
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="grid gap-3 p-3">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Submissions
      </h2>
      <div className="flex gap-2">
        <Select value={formId} onValueChange={setFormId}>
          <SelectTrigger className="h-8 flex-1" aria-label="Filter by form">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All forms</SelectItem>
            {(forms ?? []).map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={range} onValueChange={(v) => setRange(v as typeof range)}>
          <SelectTrigger className="h-8 w-28" aria-label="Date range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any time</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="justify-start"
        disabled={formId === 'all' || !rows?.length}
        onClick={exportCsv}
        title={formId === 'all' ? 'Pick a form to export' : undefined}
      >
        <Download data-icon="inline-start" /> Export CSV{formId === 'all' ? ' (pick a form)' : ''}
      </Button>
      {isLoading && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" /> Loading…
        </p>
      )}
      {rows && rows.length === 0 && (
        <p className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
          No submissions yet. Place a Form section on a published page and messages will appear
          here.
        </p>
      )}
      <ul className="grid gap-1" aria-label="Submissions">
        {(rows ?? []).map((s) => {
          const f = formOf(s.formId);
          const first = f?.fields[0] ? String(s.data[f.fields[0].id] ?? '') : '';
          return (
            <li key={s.id} className="rounded-md border">
              <div className="flex items-center gap-1 pr-1">
                <button
                  type="button"
                  onClick={() => void openRow(s)}
                  aria-expanded={open === s.id}
                  className={cn(
                    'flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-left text-sm',
                    s.status === 'new' && 'font-medium',
                  )}
                >
                  {s.status === 'new' ? (
                    <Mail className="size-3.5 shrink-0 text-primary" aria-label="New" />
                  ) : (
                    <MailOpen
                      className="size-3.5 shrink-0 text-muted-foreground"
                      aria-label="Read"
                    />
                  )}
                  <span className="truncate">{first || f?.name || 'Submission'}</span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    {relativeTime(s.createdAt)}
                  </span>
                </button>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-destructive"
                    aria-label="Delete submission"
                    onClick={async () => {
                      if (window.confirm('Delete this submission? This cannot be undone.')) {
                        await deleteSubmission(supabase, s.id);
                        await invalidate();
                      }
                    }}
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
              {open === s.id && (
                <dl className="grid gap-1.5 border-t bg-muted/30 p-2.5 text-xs">
                  {(f?.fields ?? Object.keys(s.data).map((k) => ({ id: k, label: k }))).map(
                    (fld) => (
                      <div key={fld.id}>
                        <dt className="text-muted-foreground">{fld.label}</dt>
                        <dd className="whitespace-pre-wrap break-words">
                          {s.data[fld.id] === true
                            ? 'Yes'
                            : s.data[fld.id] === false
                              ? 'No'
                              : String(s.data[fld.id] ?? '—')}
                        </dd>
                      </div>
                    ),
                  )}
                  <div className="text-[11px] text-muted-foreground">
                    {f?.name ?? 'Form'} · {new Date(s.createdAt).toLocaleString()}
                    {s.meta.page ? ` · from ${s.meta.page}` : ''}
                  </div>
                </dl>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
