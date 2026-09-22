import { createRedirect, deleteRedirect } from '@siteos/db';
import type { ImageRef, SiteSettings } from '@siteos/schemas';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { ImageControl } from '../controls/ImageControl';
import { useEditor } from '../EditorProvider';
import { redirectsQuery } from './site-queries';

const sdTypes = [
  { value: 'none', label: 'None' },
  { value: 'Organization', label: 'Organization' },
  { value: 'LocalBusiness', label: 'Local business' },
  { value: 'Restaurant', label: 'Restaurant' },
  { value: 'ProfessionalService', label: 'Professional service' },
  { value: 'Hotel', label: 'Hotel' },
];

/** Site-wide settings: identity, default SEO, structured data facts (never invented), redirects. */
export function SettingsPanel() {
  const { siteId, siteSettings, setSiteSettings, siteName, canEdit } = useEditor();
  const s = siteSettings;
  const set = (patch: Partial<SiteSettings>) => setSiteSettings({ ...s, ...patch });
  const setSd = (patch: Partial<SiteSettings['structuredData']>) =>
    set({ structuredData: { ...s.structuredData, ...patch } });
  const setAddr = (patch: Partial<SiteSettings['structuredData']['address']>) =>
    setSd({ address: { ...s.structuredData.address, ...patch } });
  const sd = s.structuredData;
  const showBusiness = sd.type !== 'none' && sd.type !== 'Organization';

  return (
    <div className="grid gap-4 p-3">
      <Section title="Site">
        <Field
          id="set-tagline"
          label="Tagline"
          hint="Used in the home page title: “Name — Tagline”."
        >
          <Input
            id="set-tagline"
            value={s.tagline}
            maxLength={160}
            disabled={!canEdit}
            onChange={(e) => set({ tagline: e.target.value })}
            placeholder="Specialty coffee in Bogor"
          />
        </Field>
        <Field
          id="set-description"
          label="Default description"
          hint="Search and social description for pages that don’t set their own."
        >
          <Textarea
            id="set-description"
            value={s.description}
            maxLength={300}
            rows={3}
            disabled={!canEdit}
            onChange={(e) => set({ description: e.target.value })}
          />
          <Counter value={s.description} max={160} />
        </Field>
        <Field id="set-logo" label="Logo">
          <ImageControl
            id="set-logo"
            value={s.logo}
            onChange={(v: ImageRef | null) => set({ logo: v })}
          />
        </Field>
        <Field id="set-favicon" label="Favicon" hint="Square PNG, at least 64×64.">
          <ImageControl
            id="set-favicon"
            value={s.favicon}
            onChange={(v: ImageRef | null) => set({ favicon: v })}
          />
        </Field>
        <Field
          id="set-og"
          label="Default social image"
          hint="1200×630 works best. Pages can override it."
        >
          <ImageControl
            id="set-og"
            value={s.ogImage}
            onChange={(v: ImageRef | null) => set({ ogImage: v })}
          />
        </Field>
      </Section>

      <Section title="Addresses & indexing">
        <Field
          id="set-canonical"
          label="Primary web address"
          hint="Used for canonical URLs and the sitemap once your domain is live, e.g. https://kopisudut.com"
        >
          <Input
            id="set-canonical"
            value={s.canonicalBase}
            maxLength={200}
            disabled={!canEdit}
            onChange={(e) => set({ canonicalBase: e.target.value.trim() })}
            placeholder="https://"
          />
        </Field>
        <Field id="set-twitter" label="X / Twitter handle">
          <Input
            id="set-twitter"
            value={s.twitterHandle}
            maxLength={30}
            disabled={!canEdit}
            onChange={(e) => set({ twitterHandle: e.target.value.trim() })}
            placeholder="@kopisudut"
          />
        </Field>
      </Section>

      <Section
        title="Structured data"
        hint="Facts search engines can show as rich results. Only what you fill in is published; nothing is guessed."
      >
        <Field id="sd-type" label="Business type">
          <Select
            value={sd.type}
            onValueChange={(v) => setSd({ type: v as SiteSettings['structuredData']['type'] })}
          >
            <SelectTrigger id="sd-type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sdTypes.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        {sd.type !== 'none' && (
          <>
            <Field id="sd-legal" label="Legal name" hint={`Leave empty to use “${siteName}”.`}>
              <Input
                id="sd-legal"
                value={sd.legalName}
                maxLength={120}
                onChange={(e) => setSd({ legalName: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field id="sd-tel" label="Phone">
                <Input
                  id="sd-tel"
                  value={sd.telephone}
                  maxLength={40}
                  onChange={(e) => setSd({ telephone: e.target.value })}
                />
              </Field>
              <Field id="sd-email" label="Email">
                <Input
                  id="sd-email"
                  value={sd.email}
                  maxLength={120}
                  onChange={(e) => setSd({ email: e.target.value })}
                />
              </Field>
            </div>
            {showBusiness && (
              <>
                <Field id="sd-street" label="Street address">
                  <Input
                    id="sd-street"
                    value={sd.address.street}
                    maxLength={160}
                    onChange={(e) => setAddr({ street: e.target.value })}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field id="sd-city" label="City">
                    <Input
                      id="sd-city"
                      value={sd.address.city}
                      maxLength={80}
                      onChange={(e) => setAddr({ city: e.target.value })}
                    />
                  </Field>
                  <Field id="sd-postal" label="Postal code">
                    <Input
                      id="sd-postal"
                      value={sd.address.postalCode}
                      maxLength={20}
                      onChange={(e) => setAddr({ postalCode: e.target.value })}
                    />
                  </Field>
                  <Field id="sd-region" label="Region">
                    <Input
                      id="sd-region"
                      value={sd.address.region}
                      maxLength={80}
                      onChange={(e) => setAddr({ region: e.target.value })}
                    />
                  </Field>
                  <Field id="sd-country" label="Country (2 letters)">
                    <Input
                      id="sd-country"
                      value={sd.address.country}
                      maxLength={2}
                      onChange={(e) => setAddr({ country: e.target.value.toUpperCase() })}
                      placeholder="ID"
                    />
                  </Field>
                </div>
                <Field id="sd-price" label="Price range" hint="e.g. Rp 20k–60k or $$">
                  <Input
                    id="sd-price"
                    value={sd.priceRange}
                    maxLength={20}
                    onChange={(e) => setSd({ priceRange: e.target.value })}
                  />
                </Field>
                <Field
                  id="sd-hours"
                  label="Opening hours"
                  hint="One per line, schema.org style: Mo-Fr 07:00-21:00"
                >
                  <Textarea
                    id="sd-hours"
                    rows={3}
                    value={sd.openingHours.join('\n')}
                    onChange={(e) =>
                      setSd({
                        openingHours: e.target.value
                          .split('\n')
                          .map((l) => l.trim())
                          .filter(Boolean)
                          .slice(0, 14),
                      })
                    }
                  />
                </Field>
              </>
            )}
            <Field
              id="sd-sameas"
              label="Profile links"
              hint="One per line: Instagram, Google Business, Facebook…"
            >
              <Textarea
                id="sd-sameas"
                rows={3}
                value={sd.sameAs.join('\n')}
                onChange={(e) =>
                  setSd({
                    sameAs: e.target.value
                      .split('\n')
                      .map((l) => l.trim())
                      .filter((l) => /^https?:\/\//.test(l))
                      .slice(0, 10),
                  })
                }
              />
            </Field>
          </>
        )}
      </Section>

      <Redirects siteId={siteId} canEdit={canEdit} />
    </div>
  );
}

function Redirects({ siteId, canEdit }: { siteId: string; canEdit: boolean }) {
  const qc = useQueryClient();
  const { data: rows } = useQuery(redirectsQuery(siteId));
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const add = async () => {
    setError(null);
    const f = from.trim();
    const t = to.trim();
    if (!/^\/[^\s?#]*$/.test(f)) return setError('The old address must be a path like /about-us.');
    if (!/^(\/[^\s]*|https?:\/\/[^\s]+)$/.test(t))
      return setError('The new address must be a path like /about or a full URL.');
    if (f === t) return setError('Old and new address are the same.');
    try {
      await createRedirect(supabase, siteId, f, t);
      await qc.invalidateQueries({ queryKey: ['redirects', siteId] });
      setFrom('');
      setTo('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create redirect');
    }
  };
  return (
    <Section
      title="Redirects"
      hint="Send visitors from an old address to a new one so links and bookmarks keep working."
    >
      {canEdit && (
        <form
          className="grid gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void add();
          }}
        >
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5">
            <Input
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="/old-page"
              aria-label="Old address"
              className="h-8 font-mono text-xs"
            />
            <ArrowRight className="size-3.5 text-muted-foreground" />
            <Input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="/new-page"
              aria-label="New address"
              className="h-8 font-mono text-xs"
            />
          </div>
          {error && (
            <p role="alert" className="text-[11px] text-destructive">
              {error}
            </p>
          )}
          <Button
            type="submit"
            size="sm"
            variant="outline"
            className="justify-start"
            disabled={!from || !to}
          >
            <Plus data-icon="inline-start" /> Add redirect
          </Button>
        </form>
      )}
      <ul className="grid gap-1" aria-label="Redirects">
        {(rows ?? []).length === 0 && (
          <li className="text-[11px] text-muted-foreground">No redirects yet.</li>
        )}
        {(rows ?? []).map((r) => (
          <li
            key={r.id}
            className="flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-xs"
          >
            <span className="truncate">{r.fromPath}</span>
            <ArrowRight className="size-3 shrink-0 text-muted-foreground" />
            <span className="truncate">{r.toPath}</span>
            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto size-6 text-muted-foreground hover:text-destructive"
                aria-label={`Delete redirect from ${r.fromPath}`}
                onClick={async () => {
                  await deleteRedirect(supabase, r.id);
                  await qc.invalidateQueries({ queryKey: ['redirects', siteId] });
                }}
              >
                <Trash2 />
              </Button>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-2.5 border-b pb-4 last:border-0">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
        {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </section>
  );
}
function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
export function Counter({ value, max }: { value: string; max: number }) {
  return (
    <p
      className={cn(
        'text-right text-[11px] text-muted-foreground',
        value.length > max && 'text-amber-600',
      )}
    >
      {value.length}/{max}
      {value.length > max ? ' · may be cut off in search results' : ''}
    </p>
  );
}
