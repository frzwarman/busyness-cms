import {
  buildSections,
  imagesFor,
  packOrGeneric,
  type RecipeId,
  recipes,
  type SiteDetails,
} from '@siteos/business-packs';
import { createPage } from '@siteos/db';
import { pageDocumentSchema, slugSchema } from '@siteos/schemas';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { globalsQuery } from './content/content-queries';
import { useEditor } from './EditorProvider';
import { formsQuery } from './site/site-queries';

/** New page = a name plus "what should this page accomplish?". The recipe is a starting point, not a template lock. */
export function NewPageDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { siteId, siteName, siteSettings, pages, businessType } = useEditor();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: forms } = useQuery(formsQuery(siteId));
  const { data: globals } = useQuery(globalsQuery(siteId));
  const [title, setTitle] = useState('');
  const [recipe, setRecipe] = useState<RecipeId>('blank');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slug = `/${title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`;

  const create = async () => {
    setError(null);
    if (!title.trim() || !slugSchema.safeParse(slug).success)
      return setError('Give the page a name using letters or numbers.');
    if (pages.some((p) => p.slug === slug))
      return setError(`A page with the address ${slug} already exists.`);
    setBusy(true);
    try {
      const pack = packOrGeneric(businessType);
      const sd = siteSettings.structuredData;
      const details: SiteDetails = {
        name: siteName,
        tagline: siteSettings.tagline,
        phone: sd.telephone,
        email: sd.email,
        street: sd.address.street,
        city: sd.address.city,
      };
      const pageIds = Object.fromEntries(
        pages.map((p) => [p.slug === '/' ? 'home' : p.slug.replace(/^\//, ''), p.id]),
      );
      const contactPage = pages.find((p) =>
        /contact|book|enquire|quote|consultation|appointments|reservations|trial|demo|hire|valuation/.test(
          p.slug,
        ),
      );
      if (contactPage) pageIds.contact = contactPage.id;
      const formIds = Object.fromEntries(
        (forms ?? []).map((f) => [
          f.name.toLowerCase().includes('booking')
            ? 'booking'
            : f.name.toLowerCase().includes('quote')
              ? 'quote'
              : f.name.toLowerCase().includes('job')
                ? 'job'
                : f.name.toLowerCase().includes('newsletter')
                  ? 'newsletter'
                  : 'contact',
          f.id,
        ]),
      );
      let sections = buildSections(recipe, {
        pack,
        details,
        pageIds,
        formIds,
        images: imagesFor(pack),
      });
      // Reuse the site's global navbar/footer when they exist so the new page matches the others.
      const nav = globals?.find((g) => g.section.type === 'navbar');
      const foot = globals?.find((g) => g.section.type === 'footer');
      const placeholder = (g: NonNullable<typeof nav>) => ({
        id: `sec_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`,
        type: g.section.type,
        schemaVersion: g.section.schemaVersion,
        hidden: false,
        globalId: g.id,
        props: structuredClone(g.section.props),
      });
      sections = [
        ...(nav ? [placeholder(nav)] : []),
        ...sections,
        ...(foot ? [placeholder(foot)] : []),
      ];
      const doc = pageDocumentSchema.parse({ id: 'pending', slug, title: title.trim(), sections });
      const pageId = await createPage(supabase, siteId, doc);
      await qc.invalidateQueries({ queryKey: ['pages', siteId] });
      onOpenChange(false);
      setTitle('');
      void navigate({ to: '/sites/$siteId/pages/$pageId', params: { siteId, pageId } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create the page.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New page</DialogTitle>
          <DialogDescription>
            Name it, then choose what the page should accomplish. We lay out a first draft you can
            change freely.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void create();
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="new-page-title" className="text-xs">
              Page name
            </Label>
            <Input
              id="new-page-title"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Menu"
              aria-describedby="new-page-slug"
            />
            <p id="new-page-slug" className="text-[11px] text-muted-foreground">
              Address: {slug}
            </p>
          </div>
          <fieldset className="grid gap-1.5">
            <legend className="mb-1.5 text-xs font-medium">
              What should this page accomplish?
            </legend>
            <ul className="grid gap-2 sm:grid-cols-2" aria-label="Page recipes">
              {recipes
                .filter((r) => r.id !== 'home')
                .map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => setRecipe(r.id)}
                      aria-pressed={recipe === r.id}
                      className={cn(
                        'w-full rounded-md border p-2.5 text-left hover:bg-muted',
                        recipe === r.id && 'border-foreground ring-1 ring-foreground',
                      )}
                    >
                      <span className="block text-sm font-medium">{r.label}</span>
                      <span className="block text-[11px] text-muted-foreground">
                        {r.description}
                      </span>
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
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !title.trim()}>
              {busy && <Loader2 className="animate-spin" />} Create page
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
