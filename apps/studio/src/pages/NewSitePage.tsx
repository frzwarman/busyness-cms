import {
  type BusinessPack,
  businessPacks,
  planSite,
  type SiteDetails,
} from '@siteos/business-packs';
import { contrastLevel, fontStacks, themePresets } from '@siteos/design-system';
import { type IconName, iconPaths } from '@siteos/sections';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createSiteFromPack } from '@/lib/create-site';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const steps = ['Business', 'Details', 'Style', 'Colors', 'Pages', 'Create'] as const;

/**
 * Guided site creation. Every answer is a suggestion the owner can change later; steps 4–5 can be skipped.
 * The result is ordinary records (pages, globals, forms, settings) with no dependency on the pack.
 */
export function NewSitePage() {
  const [step, setStep] = useState(0);
  const [pack, setPack] = useState<BusinessPack | null>(null);
  const [details, setDetails] = useState<SiteDetails>({
    name: '',
    tagline: '',
    phone: '',
    email: '',
    street: '',
    city: '',
  });
  const [presetId, setPresetId] = useState<string>('minimal');
  const [colors, setColors] = useState<{ primary?: string; accent?: string }>({});
  const [pageKeys, setPageKeys] = useState<string[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const choosePack = (p: BusinessPack) => {
    setPack(p);
    setPresetId(p.suggestedPreset);
    setPageKeys(p.suggestedPages.filter((x) => x.recommended).map((x) => x.key));
    setStep(1);
  };
  const plan = useMemo(
    () =>
      pack ? planSite(pack, details, { presetId, colors, pageKeys: pageKeys ?? undefined }) : null,
    [pack, details, presetId, colors, pageKeys],
  );
  const preset = themePresets.find((p) => p.id === presetId);
  const primary = colors.primary ?? preset?.tokens.colors.primary ?? '#000000';
  const contrastWarning =
    plan && contrastLevel(plan.theme.colors.text, plan.theme.colors.background) === 'fail';

  const create = async () => {
    if (!pack || !plan) return;
    setError(null);
    setBusy('Starting…');
    try {
      const { siteId, homePageId } = await createSiteFromPack(
        supabase,
        {
          pack,
          details: { ...details, name: details.name.trim() },
          presetId,
          colors,
          pageKeys: pageKeys ?? [],
        },
        setBusy,
      );
      await qc.invalidateQueries();
      void navigate({ to: '/sites/$siteId/pages/$pageId', params: { siteId, pageId: homePageId } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create the site.');
      setBusy(null);
    }
  };

  const canNext =
    step === 0
      ? pack !== null
      : step === 1
        ? details.name.trim().length > 0
        : step === 4
          ? (pageKeys?.length ?? 0) > 0
          : true;

  return (
    <main className="min-h-dvh bg-muted/40 p-4 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <span className="grid size-6 place-items-center rounded-md bg-foreground text-[11px] font-bold text-background">
              S
            </span>{' '}
            SiteOS
          </Link>
          <ol
            className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex"
            aria-label="Steps"
          >
            {steps.map((s, i) => (
              <li key={s} className="flex items-center gap-1">
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5',
                    i === step && 'bg-foreground text-background',
                    i < step && 'text-foreground',
                  )}
                >
                  {s}
                </span>
                {i < steps.length - 1 && <span aria-hidden="true">·</span>}
              </li>
            ))}
          </ol>
        </header>

        <section
          className="rounded-lg border bg-background p-6 shadow-sm"
          aria-labelledby="step-title"
        >
          {step === 0 && (
            <>
              <h1 id="step-title" className="text-lg font-semibold tracking-tight">
                What kind of business is this?
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                We’ll suggest pages, sections and a style. You can change everything afterwards.
              </p>
              <ul
                className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4"
                aria-label="Business types"
              >
                {businessPacks.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => choosePack(p)}
                      aria-pressed={pack?.id === p.id}
                      className={cn(
                        'flex h-full w-full flex-col items-start gap-2 rounded-md border p-3 text-left hover:bg-muted',
                        pack?.id === p.id && 'border-foreground ring-1 ring-foreground',
                      )}
                    >
                      <Glyph name={p.icon} />
                      <span className="text-sm font-medium">{p.name}</span>
                      <span className="text-[11px] leading-snug text-muted-foreground">
                        {p.description}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {step === 1 && pack && (
            <>
              <h1 id="step-title" className="text-lg font-semibold tracking-tight">
                Tell us about{' '}
                {pack.name.toLowerCase() === 'other business'
                  ? 'your business'
                  : `your ${pack.name.toLowerCase()}`}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Only the name is required. The rest fills in your footer, contact page and search
                listing.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field id="name" label="Business name" required>
                  <Input
                    id="name"
                    autoFocus
                    required
                    maxLength={120}
                    value={details.name}
                    onChange={(e) => setDetails({ ...details, name: e.target.value })}
                    placeholder="Warung Ibu Wati"
                  />
                </Field>
                <Field id="tagline" label="Tagline" hint="One line under the name.">
                  <Input
                    id="tagline"
                    maxLength={160}
                    value={details.tagline}
                    onChange={(e) => setDetails({ ...details, tagline: e.target.value })}
                    placeholder="Slow-cooked, shared, remembered"
                  />
                </Field>
                <Field id="phone" label="Phone">
                  <Input
                    id="phone"
                    type="tel"
                    maxLength={32}
                    value={details.phone}
                    onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                    placeholder="+62 251 555 0100"
                  />
                </Field>
                <Field id="email" label="Email">
                  <Input
                    id="email"
                    type="email"
                    maxLength={120}
                    value={details.email}
                    onChange={(e) => setDetails({ ...details, email: e.target.value })}
                    placeholder="hello@example.com"
                  />
                </Field>
                <Field id="street" label="Street address">
                  <Input
                    id="street"
                    maxLength={160}
                    value={details.street}
                    onChange={(e) => setDetails({ ...details, street: e.target.value })}
                    placeholder="Jl. Pajajaran No. 12"
                  />
                </Field>
                <Field id="city" label="City">
                  <Input
                    id="city"
                    maxLength={80}
                    value={details.city}
                    onChange={(e) => setDetails({ ...details, city: e.target.value })}
                    placeholder="Bogor"
                  />
                </Field>
              </div>
            </>
          )}

          {step === 2 && pack && (
            <>
              <h1 id="step-title" className="text-lg font-semibold tracking-tight">
                Pick a style
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Fonts, spacing and colors. We suggest{' '}
                <strong>{themePresets.find((p) => p.id === pack.suggestedPreset)?.name}</strong> for
                a {pack.name.toLowerCase()}. Your content is never affected by switching.
              </p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2" aria-label="Styles">
                {themePresets.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setPresetId(p.id);
                        setColors({});
                      }}
                      aria-pressed={presetId === p.id}
                      aria-label={`${p.name} style`}
                      className={cn(
                        'w-full rounded-md border p-3 text-left hover:bg-muted',
                        presetId === p.id && 'border-foreground ring-1 ring-foreground',
                      )}
                    >
                      <div
                        className="rounded-md p-3"
                        style={{
                          background: p.tokens.colors.background,
                          color: p.tokens.colors.text,
                        }}
                      >
                        <div
                          className="text-lg leading-tight"
                          style={{
                            fontFamily: fontStacks[p.tokens.typography.headingFont].stack,
                            fontWeight: 600,
                          }}
                        >
                          {details.name || 'Your business'}
                        </div>
                        <div
                          className="mt-1 text-xs"
                          style={{
                            fontFamily: fontStacks[p.tokens.typography.bodyFont].stack,
                            color: p.tokens.colors.muted,
                          }}
                        >
                          {details.tagline || pack.content.hero.description.split('.')[0]}
                        </div>
                        <div
                          className="mt-2 inline-block rounded px-2 py-1 text-[11px] font-semibold"
                          style={{
                            background: p.tokens.colors.primary,
                            color: p.tokens.colors.background,
                            borderRadius:
                              p.tokens.shape.radius === 'full'
                                ? 999
                                : p.tokens.shape.radius === 'none'
                                  ? 0
                                  : 6,
                          }}
                        >
                          {pack.content.hero.primaryCta}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {p.name}
                          {p.id === pack.suggestedPreset ? (
                            <span className="ml-1 text-xs text-muted-foreground">· suggested</span>
                          ) : null}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{p.description}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {step === 3 && pack && preset && (
            <>
              <h1 id="step-title" className="text-lg font-semibold tracking-tight">
                Brand colors
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Optional. Keep the preset’s colors or set your own. Your logo can be added in Site
                settings once the site exists.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <ColorField
                  id="primary"
                  label="Primary color"
                  value={colors.primary ?? preset.tokens.colors.primary}
                  onChange={(v) => setColors({ ...colors, primary: v })}
                />
                <ColorField
                  id="accent"
                  label="Accent color"
                  value={colors.accent ?? preset.tokens.colors.accent}
                  onChange={(v) => setColors({ ...colors, accent: v })}
                />
              </div>
              {Object.keys(colors).length > 0 && (
                <Button variant="ghost" size="sm" className="mt-3" onClick={() => setColors({})}>
                  Reset to preset colors
                </Button>
              )}
              {plan && (
                <div
                  className="mt-5 rounded-md border p-4"
                  style={{
                    background: plan.theme.colors.background,
                    color: plan.theme.colors.text,
                  }}
                >
                  <div
                    className="text-base font-semibold"
                    style={{ fontFamily: fontStacks[plan.theme.typography.headingFont].stack }}
                  >
                    {details.name || 'Your business'}
                  </div>
                  <span
                    className="mt-2 inline-block rounded px-3 py-1.5 text-xs font-semibold"
                    style={{
                      background: primary,
                      color: contrastLevel('#ffffff', primary) === 'fail' ? '#111111' : '#ffffff',
                    }}
                  >
                    {pack.content.hero.primaryCta}
                  </span>
                </div>
              )}
              {contrastWarning && (
                <p className="mt-2 text-xs text-amber-600">
                  This text/background combination may not meet WCAG AA contrast requirements.
                </p>
              )}
            </>
          )}

          {step === 4 && pack && (
            <>
              <h1 id="step-title" className="text-lg font-semibold tracking-tight">
                Recommended pages
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Each page starts with realistic sections you can edit or remove. Untick what you
                don’t need; add more later.
              </p>
              <ul className="mt-5 grid gap-2" aria-label="Pages">
                {pack.suggestedPages.map((p) => {
                  const on = (pageKeys ?? []).includes(p.key);
                  const locked = p.key === 'home';
                  return (
                    <li key={p.key}>
                      <label
                        className={cn(
                          'flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-muted',
                          on && 'border-foreground/40',
                        )}
                      >
                        <input
                          type="checkbox"
                          className="mt-1 size-4 accent-foreground"
                          checked={on}
                          disabled={locked}
                          onChange={(e) =>
                            setPageKeys(
                              e.target.checked
                                ? [...(pageKeys ?? []), p.key]
                                : (pageKeys ?? []).filter((k) => k !== p.key),
                            )
                          }
                        />
                        <span className="min-w-0">
                          <span className="flex items-center gap-2 text-sm font-medium">
                            {p.title}{' '}
                            <span className="font-mono text-[11px] text-muted-foreground">
                              {p.slug}
                            </span>
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {p.description}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {step === 5 && pack && plan && (
            <>
              <h1 id="step-title" className="text-lg font-semibold tracking-tight">
                Ready to create {details.name.trim()}
              </h1>
              <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <Row k="Business type" v={pack.name} />
                <Row
                  k="Style"
                  v={`${preset?.name ?? presetId}${Object.keys(colors).length ? ' · custom colors' : ''}`}
                />
                <Row k="Pages" v={plan.pages.map((p) => p.title).join(', ')} />
                <Row k="Forms" v={plan.forms.map((f) => f.definition.name).join(', ')} />
                <Row
                  k="Search listing"
                  v={`${pack.structuredDataType}${details.phone ? ` · ${details.phone}` : ''}`}
                />
                <Row
                  k="Navigation & footer"
                  v="Created as global sections (edit once, everywhere)"
                />
              </dl>
              <p className="mt-4 text-xs text-muted-foreground">
                Nothing is published yet. You’ll land in the editor to review, then publish when
                ready.
              </p>
              {error && (
                <p role="alert" className="mt-3 text-sm text-destructive">
                  {error}
                </p>
              )}
            </>
          )}

          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <Button
              variant="ghost"
              disabled={step === 0 || busy !== null}
              onClick={() => setStep((s) => s - 1)}
            >
              <ArrowLeft data-icon="inline-start" /> Back
            </Button>
            <div className="flex items-center gap-2">
              {(step === 3 || step === 4) && (
                <Button
                  variant="ghost"
                  disabled={busy !== null}
                  onClick={() => setStep((s) => s + 1)}
                >
                  Skip
                </Button>
              )}
              {step < 5 ? (
                <Button disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
                  Continue <ArrowRight data-icon="inline-end" />
                </Button>
              ) : (
                <Button disabled={busy !== null} onClick={() => void create()}>
                  {busy ? (
                    <>
                      <Loader2 className="animate-spin" /> {busy}
                    </>
                  ) : (
                    <>
                      <Check /> Create site
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({
  id,
  label,
  hint,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-xs">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} picker`}
          className="size-9 shrink-0 cursor-pointer rounded border bg-transparent p-0.5"
        />
        <Input
          id={id}
          value={value}
          onChange={(e) => /^#[0-9a-fA-F]{6}$/.test(e.target.value) && onChange(e.target.value)}
          className="font-mono text-xs"
        />
      </div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-md border p-2.5">
      <dt className="text-[11px] text-muted-foreground">{k}</dt>
      <dd className="mt-0.5">{v}</dd>
    </div>
  );
}
function Glyph({ name }: { name: IconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-5 text-muted-foreground"
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}
