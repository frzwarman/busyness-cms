import { createSite, slugForSite } from '@siteos/db';
import { getPreset, themePresets } from '@siteos/design-system';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { seedDemoPages } from '@/lib/seed';
import { supabase } from '@/lib/supabase';

/**
 * Minimal site creation: name + theme. The guided flow (business type, logo, recommended pages)
 * arrives with business packs in Milestone 8; this creates the same records it will.
 */
export function NewSitePage() {
  const [name, setName] = useState('');
  const [preset, setPreset] = useState('editorial');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const theme = (getPreset(preset) ?? themePresets[0])?.tokens;
      if (!theme) throw new Error('No theme preset available.');
      const siteId = await createSite(supabase, {
        name: name.trim(),
        slug: slugForSite(name),
        theme,
      });
      const homeId = await seedDemoPages(supabase, siteId);
      await qc.invalidateQueries();
      void navigate({ to: '/sites/$siteId/pages/$pageId', params: { siteId, pageId: homeId } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the site.');
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-dvh place-items-center bg-muted/40 p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-lg border bg-background p-6 shadow-sm"
      >
        <h1 className="text-lg font-semibold tracking-tight">Create your site</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You'll get a Home and About page with example content to replace.
        </p>
        <div className="mt-6 grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="site-name">Business name</Label>
            <Input
              id="site-name"
              autoFocus
              required
              maxLength={120}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Kopi Sudut"
            />
          </div>
          <fieldset className="grid gap-1.5">
            <legend className="text-sm font-medium">Visual style</legend>
            <ul className="grid grid-cols-2 gap-2">
              {themePresets.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setPreset(p.id)}
                    aria-pressed={preset === p.id}
                    className={`w-full rounded-md border p-2 text-left hover:bg-muted ${preset === p.id ? 'border-foreground ring-1 ring-foreground' : ''}`}
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
                  </button>
                </li>
              ))}
            </ul>
          </fieldset>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" disabled={busy || !name.trim()}>
            {busy && <Loader2 className="animate-spin" />} Create site
          </Button>
        </div>
      </form>
    </main>
  );
}
