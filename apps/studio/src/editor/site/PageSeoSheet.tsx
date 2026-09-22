import { canonicalUrl, type ImageRef, type PageDocument, slugSchema } from '@siteos/schemas';
import { Globe, Search } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { PREVIEW_ORIGIN } from '@/lib/preview-bridge';
import { ImageControl } from '../controls/ImageControl';
import { useEditor } from '../EditorProvider';
import { Counter } from './SettingsPanel';

/** Per-page SEO with search and social previews. Previews are approximations, labelled as such. */
export function PageSeoSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { state, dispatch, siteName, siteSlug, siteSettings, canEdit } = useEditor();
  const page = state.document;
  const seo = page.seo;
  const setSeo = (patch: Partial<PageDocument['seo']>) =>
    dispatch({ type: 'updateSeo', seo: { ...seo, ...patch } });
  const [slugDraft, setSlugDraft] = useState(page.slug);
  const slugValid = slugSchema.safeParse(slugDraft).success;

  const title =
    seo.title ??
    (page.slug === '/' && siteSettings.tagline
      ? `${siteName} — ${siteSettings.tagline}`
      : `${page.title} — ${siteName}`);
  const description = seo.description ?? siteSettings.description;
  const url = canonicalUrl(
    page,
    siteSettings,
    `${PREVIEW_ORIGIN}/s/${siteSlug}${page.slug}`,
    `/s/${siteSlug}`,
  );
  const ogImage = seo.ogImage ?? siteSettings.ogImage;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[28rem] overflow-auto sm:max-w-[28rem]">
        <SheetHeader>
          <SheetTitle>Page settings</SheetTitle>
          <SheetDescription>
            Title, address and how this page appears in search results and when shared.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-5 px-4 pb-6 text-sm">
          <div className="grid gap-1.5">
            <Label htmlFor="page-title" className="text-xs">
              Page name
            </Label>
            <Input
              id="page-title"
              value={page.title}
              maxLength={120}
              disabled={!canEdit}
              onChange={(e) => dispatch({ type: 'renamePage', title: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="page-slug" className="text-xs">
              Address
            </Label>
            <Input
              id="page-slug"
              value={slugDraft}
              disabled={!canEdit || page.slug === '/'}
              className="font-mono text-xs"
              onChange={(e) => setSlugDraft(e.target.value)}
              onBlur={() => {
                if (slugValid && slugDraft !== page.slug)
                  dispatch({ type: 'setSlug', slug: slugDraft });
              }}
              aria-invalid={!slugValid}
            />
            {!slugValid && (
              <p className="text-[11px] text-destructive">
                Use lowercase letters, numbers and dashes, starting with /.
              </p>
            )}
            {slugValid && slugDraft !== page.slug && (
              <p className="text-[11px] text-muted-foreground">
                Changing a published address breaks old links. Add a redirect in Site settings from{' '}
                {page.slug} to {slugDraft}.
              </p>
            )}
          </div>

          <section className="grid gap-3 border-t pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Search
            </h3>
            <div className="rounded-md border p-3" aria-label="Search result preview (approximate)">
              <p className="mb-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                <Search className="size-3" /> Preview — search engines may show something different
              </p>
              <p className="truncate text-xs text-emerald-700 dark:text-emerald-400">{url}</p>
              <p className="truncate text-base text-[#1a0dab] dark:text-blue-400">{title}</p>
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {description || 'Add a description so people know what this page is about.'}
              </p>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="seo-title" className="text-xs">
                Search title
              </Label>
              <Input
                id="seo-title"
                value={seo.title ?? ''}
                maxLength={70}
                disabled={!canEdit}
                placeholder={title}
                onChange={(e) => setSeo({ title: e.target.value || undefined })}
              />
              <Counter value={seo.title ?? title} max={60} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="seo-description" className="text-xs">
                Description
              </Label>
              <Textarea
                id="seo-description"
                rows={3}
                value={seo.description ?? ''}
                maxLength={200}
                disabled={!canEdit}
                placeholder={siteSettings.description || 'One or two sentences about this page.'}
                onChange={(e) => setSeo({ description: e.target.value || undefined })}
              />
              <Counter value={seo.description ?? siteSettings.description} max={160} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="seo-canonical" className="text-xs">
                Canonical URL override
              </Label>
              <Input
                id="seo-canonical"
                value={seo.canonical ?? ''}
                disabled={!canEdit}
                placeholder="Only if this page duplicates another URL"
                onChange={(e) => setSeo({ canonical: e.target.value || undefined })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="seo-noindex" className="text-xs font-normal">
                Hide from search engines
              </Label>
              <Switch
                id="seo-noindex"
                checked={seo.noindex}
                disabled={!canEdit}
                onCheckedChange={(v) => setSeo({ noindex: v })}
              />
            </div>
          </section>

          <section className="grid gap-3 border-t pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              When shared
            </h3>
            <div
              className="overflow-hidden rounded-md border"
              aria-label="Social card preview (approximate)"
            >
              <div className="aspect-[1.91/1] bg-muted">
                {ogImage?.src && (
                  <img
                    src={ogImage.src}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{
                      objectPosition: `${(ogImage.focalX ?? 0.5) * 100}% ${(ogImage.focalY ?? 0.5) * 100}%`,
                    }}
                  />
                )}
              </div>
              <div className="p-2.5">
                <p className="flex items-center gap-1 text-[11px] uppercase text-muted-foreground">
                  <Globe className="size-3" /> {(() => {
                    try {
                      return new URL(url).host;
                    } catch {
                      return url;
                    }
                  })()}
                </p>
                <p className="truncate text-sm font-medium">{seo.ogTitle ?? title}</p>
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {seo.ogDescription ?? description}
                </p>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="og-title" className="text-xs">
                Social title
              </Label>
              <Input
                id="og-title"
                value={seo.ogTitle ?? ''}
                maxLength={95}
                disabled={!canEdit}
                placeholder={title}
                onChange={(e) => setSeo({ ogTitle: e.target.value || undefined })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="og-description" className="text-xs">
                Social description
              </Label>
              <Textarea
                id="og-description"
                rows={2}
                value={seo.ogDescription ?? ''}
                maxLength={200}
                disabled={!canEdit}
                placeholder={description}
                onChange={(e) => setSeo({ ogDescription: e.target.value || undefined })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Social image</Label>
              <ImageControl
                id="og-image"
                value={seo.ogImage ?? null}
                onChange={(v: ImageRef | null) => setSeo({ ogImage: v ?? undefined })}
              />
              {!seo.ogImage && (
                <p className="text-[11px] text-muted-foreground">
                  {siteSettings.ogImage
                    ? 'Using the site’s default social image.'
                    : 'No image yet: set a default in Site settings or choose one here.'}
                </p>
              )}
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
