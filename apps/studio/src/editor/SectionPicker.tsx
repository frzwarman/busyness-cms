import {
  registry,
  type SectionCategory,
  type SectionDefinition,
  sectionCategories,
} from '@siteos/sections';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Globe, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { globalsQuery } from './content/content-queries';
import { useEditor } from './EditorProvider';
import { Thumbnail } from './Thumbnail';

const RECENT_KEY = 'siteos:recent-sections';
function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function SectionPicker() {
  const { pickerOpen, setPickerOpen, dispatch, state, siteId, businessType } = useEditor();
  const { data: globals } = useQuery(globalsQuery(siteId));
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<
    SectionCategory | 'all' | 'recent' | 'globals' | 'recommended'
  >('recommended');
  const [picked, setPicked] = useState<SectionDefinition | null>(null);
  const recent = useMemo(() => readRecent(), []);

  useEffect(() => {
    if (!pickerOpen) {
      setPicked(null);
      setQuery('');
    }
  }, [pickerOpen]);

  const results = useMemo(() => {
    let list = registry.search(query);
    // A typed search looks across every section, whatever category is selected.
    if (query.trim() && category !== 'globals') return list;
    if (category === 'recent') list = list.filter((d) => recent.includes(d.type));
    else if (category === 'recommended')
      list = list.filter(
        (d) => d.recommendedFor.includes(businessType) || d.recommendedFor.includes('*'),
      );
    else if (category === 'globals') list = [];
    else if (category !== 'all') list = list.filter((d) => d.category === category);
    return list;
  }, [query, category, recent, businessType]);

  const categoriesInUse = sectionCategories.filter((c) => registry.byCategory(c.id).length > 0);

  const add = (def: SectionDefinition, variant: string) => {
    const selectedIndex = state.document.sections.findIndex(
      (s) => s.id === state.selectedSectionId,
    );
    dispatch({
      type: 'addSection',
      sectionType: def.type,
      overrides: { variant },
      index: selectedIndex === -1 ? undefined : selectedIndex + 1,
    });
    try {
      localStorage.setItem(
        RECENT_KEY,
        JSON.stringify([def.type, ...recent.filter((t) => t !== def.type)].slice(0, 8)),
      );
    } catch {}
    setPickerOpen(false);
  };

  return (
    <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle>{picked ? `Add ${picked.title}` : 'Add a section'}</DialogTitle>
          <DialogDescription>
            {picked
              ? picked.description
              : 'Sections are structured building blocks. Pick one, then choose how it should be laid out.'}
          </DialogDescription>
        </DialogHeader>
        {picked ? (
          <div className="flex-1 overflow-auto p-5">
            <Button variant="ghost" size="sm" className="mb-3" onClick={() => setPicked(null)}>
              <ArrowLeft data-icon="inline-start" /> All sections
            </Button>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {picked.variants.map((v) => (
                <li key={v.value}>
                  <button
                    type="button"
                    onClick={() => add(picked, v.value)}
                    className="group w-full rounded-lg border p-2 text-left transition hover:border-foreground/40 hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <Thumbnail wire={v.thumbnail} className="group-hover:border-foreground/30" />
                    <div className="mt-2 px-1">
                      <div className="text-sm font-medium">{v.label}</div>
                      {v.description && (
                        <div className="text-xs text-muted-foreground">{v.description}</div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1">
            <nav
              className="hidden w-44 shrink-0 space-y-0.5 overflow-auto border-r p-2 sm:block"
              aria-label="Section categories"
            >
              {[
                { id: 'recommended' as const, label: 'Recommended for you' },
                { id: 'all' as const, label: 'All sections' },
                ...(recent.length ? [{ id: 'recent' as const, label: 'Recently used' }] : []),
                ...(globals?.length ? [{ id: 'globals' as const, label: 'Global sections' }] : []),
                ...categoriesInUse,
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  aria-current={category === c.id ? 'true' : undefined}
                  className={cn(
                    'block w-full rounded-md px-2.5 py-1.5 text-left text-sm hover:bg-muted',
                    category === c.id && 'bg-muted font-medium',
                  )}
                >
                  {c.label}
                </button>
              ))}
            </nav>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="relative border-b p-3">
                <Search className="pointer-events-none absolute top-1/2 left-6 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search sections (e.g. hero, contact, story)"
                  className="pl-9"
                  aria-label="Search sections"
                />
              </div>
              <div className="flex-1 overflow-auto p-4">
                {category === 'globals' ? (
                  <ul
                    className="grid grid-cols-2 gap-3 md:grid-cols-3"
                    aria-label="Global sections"
                  >
                    {(globals ?? []).map((g) => {
                      const def = registry.get(g.section.type);
                      return (
                        <li key={g.id}>
                          <button
                            type="button"
                            onClick={() => {
                              const selectedIndex = state.document.sections.findIndex(
                                (s) => s.id === state.selectedSectionId,
                              );
                              dispatch({
                                type: 'insertGlobal',
                                globalId: g.id,
                                content: g.section,
                                index: selectedIndex === -1 ? undefined : selectedIndex + 1,
                              });
                              setPickerOpen(false);
                            }}
                            className="group w-full rounded-lg border p-2 text-left transition hover:border-foreground/40 hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring"
                          >
                            <Thumbnail
                              wire={
                                def?.variants.find((v) => v.value === g.section.props.variant)
                                  ?.thumbnail ?? ['H']
                              }
                            />
                            <div className="mt-2 flex items-center gap-1.5 px-1 text-sm font-medium">
                              <Globe className="size-3.5 text-muted-foreground" /> {g.name}
                            </div>
                            <div className="px-1 text-xs text-muted-foreground">
                              {def?.title ?? g.section.type} · shared across pages
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : results.length === 0 ? (
                  <p className="p-6 text-center text-sm text-muted-foreground">
                    No sections match “{query}”. More section types arrive with the section library
                    milestone.
                  </p>
                ) : (
                  <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {results.map((def) => (
                      <li key={def.type}>
                        <button
                          type="button"
                          onClick={() =>
                            def.variants.length > 1
                              ? setPicked(def)
                              : add(def, def.variants[0]?.value ?? String(def.defaults.variant))
                          }
                          className="group w-full rounded-lg border p-2 text-left transition hover:border-foreground/40 hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring"
                        >
                          <Thumbnail
                            wire={def.variants[0]?.thumbnail ?? ['H']}
                            className="group-hover:border-foreground/30"
                          />
                          <div className="mt-2 flex items-start justify-between gap-2 px-1">
                            <div className="min-w-0">
                              <div className="text-sm font-medium">{def.title}</div>
                              <div className="line-clamp-2 text-xs text-muted-foreground">
                                {def.description}
                              </div>
                            </div>
                            {def.variants.length > 1 && (
                              <Badge variant="secondary" className="shrink-0">
                                {def.variants.length} layouts
                              </Badge>
                            )}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
