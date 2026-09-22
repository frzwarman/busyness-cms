import { themeWarnings } from '@siteos/design-system';
import type {
  ImageRef,
  PageDocument,
  PageSummary,
  SiteSettings,
  ThemeTokens,
} from '@siteos/schemas';
import { richTextToPlain, type SectionRegistry } from '@siteos/sections';

/**
 * Website Health: deterministic checks over the site's drafts, settings and theme. Every issue names what
 * is wrong, where, and what to do; categories roll up to a status. There is no numeric score because
 * none of these checks can honestly claim precision to a point.
 */
export type HealthCategory = 'brand' | 'seo' | 'accessibility' | 'content' | 'performance';
export type Severity = 'error' | 'warning' | 'info';
export type HealthIssue = {
  id: string;
  category: HealthCategory;
  severity: Severity;
  message: string;
  /** What to do about it, in the interface's voice. */
  fix: string;
  /** Where to go: a page (and optionally a section) or a settings area. */
  target:
    | { kind: 'page'; pageId: string; sectionId?: string; fieldPath?: string }
    | { kind: 'settings'; area: 'site' | 'brand' }
    | { kind: 'page-seo'; pageId: string };
};
export type CategoryStatus = 'excellent' | 'good' | 'needs-attention';
export type HealthReport = {
  issues: HealthIssue[];
  categories: Record<HealthCategory, { status: CategoryStatus; count: number }>;
  checkedPages: number;
};

export type HealthInput = {
  pages: Array<{ summary: PageSummary; document: PageDocument }>;
  settings: SiteSettings;
  theme: ThemeTokens;
  registry: SectionRegistry;
};

const PLACEHOLDER_PHRASES = [
  'replace this with',
  'replace with a real',
  'your business',
  'your name',
  'first service',
  'second service',
  'third service',
  'list your neighbourhoods',
  'update the opening hours',
];

export function runHealthChecks(input: HealthInput): HealthReport {
  const issues: HealthIssue[] = [];
  const { settings, theme, registry } = input;
  const pageIds = new Set(input.pages.map((p) => p.summary.id));

  // ---- brand -----------------------------------------------------------------------------------------
  if (!settings.logo)
    issues.push({
      id: 'brand.logo',
      category: 'brand',
      severity: 'warning',
      message: 'No logo set.',
      fix: 'Add your logo in Site settings so it appears in search results and social previews.',
      target: { kind: 'settings', area: 'site' },
    });
  if (!settings.favicon)
    issues.push({
      id: 'brand.favicon',
      category: 'brand',
      severity: 'warning',
      message: 'No favicon set.',
      fix: 'Add a square icon in Site settings; browsers show it in tabs and bookmarks.',
      target: { kind: 'settings', area: 'site' },
    });
  for (const w of themeWarnings(theme))
    issues.push({
      id: `brand.contrast.${w.pair}`,
      category: 'accessibility',
      severity: w.level === 'fail' ? 'error' : 'warning',
      message: `${w.pair} has low contrast.`,
      fix: 'Adjust the colors in Brand until the warning disappears, or choose a preset.',
      target: { kind: 'settings', area: 'brand' },
    });

  // ---- site-level seo / content -------------------------------------------------------------------
  if (!settings.description)
    issues.push({
      id: 'seo.site-description',
      category: 'seo',
      severity: 'warning',
      message: 'No default description for search results.',
      fix: 'Write one or two sentences in Site settings; pages without their own description use it.',
      target: { kind: 'settings', area: 'site' },
    });
  if (!settings.ogImage)
    issues.push({
      id: 'seo.site-og',
      category: 'seo',
      severity: 'info',
      message: 'No default social image.',
      fix: 'Add a 1200×630 image in Site settings so shared links show a picture.',
      target: { kind: 'settings', area: 'site' },
    });
  if (settings.structuredData.type === 'none')
    issues.push({
      id: 'seo.structured-data',
      category: 'seo',
      severity: 'info',
      message: 'Structured data is off.',
      fix: 'Choose your business type in Site settings so search engines can show your details as a rich result.',
      target: { kind: 'settings', area: 'site' },
    });
  if (!settings.structuredData.telephone && !settings.structuredData.email)
    issues.push({
      id: 'content.contact',
      category: 'content',
      severity: 'warning',
      message: 'No phone number or email in Site settings.',
      fix: 'Add at least one so visitors and search engines can reach you.',
      target: { kind: 'settings', area: 'site' },
    });

  // ---- per page ------------------------------------------------------------------------------------
  const seenTitles = new Map<string, string>();
  for (const { summary, document: doc } of input.pages) {
    const pid = summary.id;
    const title = doc.seo.title ?? doc.title;
    if (title.length > 60)
      issues.push({
        id: `seo.title-long.${pid}`,
        category: 'seo',
        severity: 'info',
        message: `“${doc.title}”: search title is ${title.length} characters.`,
        fix: 'Keep it under 60 so it is not cut off in results.',
        target: { kind: 'page-seo', pageId: pid },
      });
    const prevPage = seenTitles.get(title.toLowerCase());
    if (prevPage)
      issues.push({
        id: `seo.title-dup.${pid}`,
        category: 'seo',
        severity: 'warning',
        message: `“${doc.title}” shares its search title with another page.`,
        fix: 'Give each page a distinct search title.',
        target: { kind: 'page-seo', pageId: pid },
      });
    seenTitles.set(title.toLowerCase(), pid);
    const description = doc.seo.description ?? settings.description;
    if (!description)
      issues.push({
        id: `seo.desc.${pid}`,
        category: 'seo',
        severity: 'warning',
        message: `“${doc.title}” has no search description.`,
        fix: 'Add one in Page settings, or set a default in Site settings.',
        target: { kind: 'page-seo', pageId: pid },
      });
    else if (description.length > 160)
      issues.push({
        id: `seo.desc-long.${pid}`,
        category: 'seo',
        severity: 'info',
        message: `“${doc.title}”: description is ${description.length} characters.`,
        fix: 'Keep it under 160 so search engines show all of it.',
        target: { kind: 'page-seo', pageId: pid },
      });
    if (doc.seo.noindex)
      issues.push({
        id: `seo.noindex.${pid}`,
        category: 'seo',
        severity: 'info',
        message: `“${doc.title}” is hidden from search engines.`,
        fix: 'Intentional for private pages; switch it off in Page settings otherwise.',
        target: { kind: 'page-seo', pageId: pid },
      });

    const visible = doc.sections.filter((s) => !s.hidden);
    if (visible.length === 0)
      issues.push({
        id: `content.empty.${pid}`,
        category: 'content',
        severity: 'warning',
        message: `“${doc.title}” has no visible sections.`,
        fix: 'Add sections or hide the page from navigation until it is ready.',
        target: { kind: 'page', pageId: pid },
      });
    const heroes = visible.filter((s) => s.type === 'hero');
    if (heroes.length > 1)
      issues.push({
        id: `a11y.h1.${pid}`,
        category: 'accessibility',
        severity: 'warning',
        message: `“${doc.title}” has ${heroes.length} hero sections, so more than one main heading.`,
        fix: 'Keep one hero per page; use other sections for later headings.',
        target: { kind: 'page', pageId: pid, sectionId: heroes[1]?.id },
      });
    if (heroes.length === 0 && visible.length > 0)
      issues.push({
        id: `a11y.no-h1.${pid}`,
        category: 'accessibility',
        severity: 'info',
        message: `“${doc.title}” has no main heading.`,
        fix: 'Start the page with a Hero so screen readers and search engines find the page’s title.',
        target: { kind: 'page', pageId: pid },
      });

    let heavyMedia = 0;
    let videos = 0;
    for (const s of visible) {
      const def = registry.get(s.type);
      const label = def?.title ?? s.type;
      if (s.type === 'gallery' || s.type === 'portfolio') heavyMedia += 1;
      if (s.type === 'video') videos += 1;
      // images
      for (const [path, img] of imagesIn(s.props)) {
        if (!img.decorative && img.alt.trim() === '')
          issues.push({
            id: `a11y.alt.${pid}.${s.id}.${path}`,
            category: 'accessibility',
            severity: 'error',
            message: `${label} on “${doc.title}”: an image has no alt text.`,
            fix: 'Describe the image, or mark it decorative if it carries no information.',
            target: {
              kind: 'page',
              pageId: pid,
              sectionId: s.id,
              fieldPath: path.split('.')[0] ?? path,
            },
          });
        if (img.src.startsWith('/demo/placeholder'))
          issues.push({
            id: `content.placeholder-img.${pid}.${s.id}.${path}`,
            category: 'content',
            severity: 'warning',
            message: `${label} on “${doc.title}” still shows a placeholder illustration.`,
            fix: 'Replace it with a real photo from your asset library.',
            target: {
              kind: 'page',
              pageId: pid,
              sectionId: s.id,
              fieldPath: path.split('.')[0] ?? path,
            },
          });
        if (s.type === 'hero' && img.width && img.width > 2400 && !img.sources?.length)
          issues.push({
            id: `perf.hero-image.${pid}.${s.id}`,
            category: 'performance',
            severity: 'warning',
            message: `Hero image on “${doc.title}” is ${img.width}px wide with no resized versions.`,
            fix: 'Upload it through the asset library so phones get a smaller file.',
            target: { kind: 'page', pageId: pid, sectionId: s.id, fieldPath: 'media' },
          });
      }
      // buttons and links
      for (const [path, btn] of buttonsIn(s.props)) {
        if (!btn.label.trim())
          issues.push({
            id: `a11y.button.${pid}.${s.id}.${path}`,
            category: 'accessibility',
            severity: 'error',
            message: `${label} on “${doc.title}”: a button has no label.`,
            fix: 'Say what happens when it is used, e.g. “Book a table”.',
            target: { kind: 'page', pageId: pid, sectionId: s.id, fieldPath: path },
          });
        else if (/^(click here|read more|learn more|more)$/i.test(btn.label.trim()))
          issues.push({
            id: `a11y.link-text.${pid}.${s.id}.${path}`,
            category: 'accessibility',
            severity: 'info',
            message: `${label} on “${doc.title}”: “${btn.label}” does not say where it leads.`,
            fix: 'Name the destination or action, e.g. “See the menu”.',
            target: { kind: 'page', pageId: pid, sectionId: s.id, fieldPath: path },
          });
        if (btn.link.kind === 'page' && !pageIds.has(btn.link.pageId ?? ''))
          issues.push({
            id: `content.broken-link.${pid}.${s.id}.${path}`,
            category: 'content',
            severity: 'error',
            message: `${label} on “${doc.title}”: “${btn.label}” points to a page that no longer exists.`,
            fix: 'Choose another page or link type.',
            target: { kind: 'page', pageId: pid, sectionId: s.id, fieldPath: path },
          });
      }
      if (s.type === 'cta' && !s.props.primaryCta && !s.props.secondaryCta)
        issues.push({
          id: `content.empty-cta.${pid}.${s.id}`,
          category: 'content',
          severity: 'warning',
          message: `Call to action on “${doc.title}” has no button.`,
          fix: 'Add a button so the section does its job.',
          target: { kind: 'page', pageId: pid, sectionId: s.id, fieldPath: 'primaryCta' },
        });
      if (s.type === 'contact-form' && !s.props.formId)
        issues.push({
          id: `content.no-form.${pid}.${s.id}`,
          category: 'content',
          severity: 'error',
          message: `Form section on “${doc.title}” has no form selected.`,
          fix: 'Pick a form in the inspector; visitors currently see nothing there.',
          target: { kind: 'page', pageId: pid, sectionId: s.id, fieldPath: 'formId' },
        });
      // placeholder copy
      const text = textIn(s.props).toLowerCase();
      const phrase = PLACEHOLDER_PHRASES.find((p) => text.includes(p));
      if (phrase)
        issues.push({
          id: `content.placeholder.${pid}.${s.id}`,
          category: 'content',
          severity: 'warning',
          message: `${label} on “${doc.title}” still contains starter copy (“${phrase}…”).`,
          fix: 'Replace it with your own words.',
          target: { kind: 'page', pageId: pid, sectionId: s.id },
        });
    }
    if (heavyMedia > 2)
      issues.push({
        id: `perf.media.${pid}`,
        category: 'performance',
        severity: 'info',
        message: `“${doc.title}” has ${heavyMedia} image-heavy sections.`,
        fix: 'Consider moving some galleries to their own page so the home page loads faster.',
        target: { kind: 'page', pageId: pid },
      });
    if (videos > 1)
      issues.push({
        id: `perf.video.${pid}`,
        category: 'performance',
        severity: 'info',
        message: `“${doc.title}” embeds ${videos} videos.`,
        fix: 'Each embed loads a player; keep one per page where you can.',
        target: { kind: 'page', pageId: pid },
      });
  }

  const categories = Object.fromEntries(
    (['brand', 'seo', 'accessibility', 'content', 'performance'] as HealthCategory[]).map((c) => {
      const mine = issues.filter((i) => i.category === c);
      const status: CategoryStatus = mine.some((i) => i.severity === 'error')
        ? 'needs-attention'
        : mine.some((i) => i.severity === 'warning')
          ? 'good'
          : 'excellent';
      return [c, { status, count: mine.length }];
    }),
  ) as HealthReport['categories'];
  return { issues, categories, checkedPages: input.pages.length };
}

// ---- walkers -----------------------------------------------------------------------------------------
type Btn = { label: string; link: { kind: string; pageId?: string } };
function isImage(v: unknown): v is ImageRef {
  return (
    typeof v === 'object' &&
    v !== null &&
    'src' in v &&
    'alt' in v &&
    typeof (v as { src: unknown }).src === 'string'
  );
}
function isButton(v: unknown): v is Btn {
  return (
    typeof v === 'object' &&
    v !== null &&
    'label' in v &&
    'link' in v &&
    typeof (v as { link: unknown }).link === 'object'
  );
}
export function imagesIn(props: Record<string, unknown>): Array<[string, ImageRef]> {
  const out: Array<[string, ImageRef]> = [];
  walk(props, '', (path, v) => {
    if (isImage(v)) out.push([path, v]);
  });
  return out;
}
export function buttonsIn(props: Record<string, unknown>): Array<[string, Btn]> {
  const out: Array<[string, Btn]> = [];
  walk(props, '', (path, v) => {
    if (isButton(v)) out.push([path, v]);
  });
  return out;
}
function textIn(props: Record<string, unknown>): string {
  const parts: string[] = [];
  walk(props, '', (_p, v) => {
    if (typeof v === 'string') parts.push(v);
    else if (typeof v === 'object' && v !== null && (v as { type?: string }).type === 'doc')
      parts.push(richTextToPlain(v as Parameters<typeof richTextToPlain>[0]));
  });
  return parts.join(' ');
}
function walk(v: unknown, path: string, visit: (path: string, v: unknown) => void) {
  visit(path, v);
  if (typeof v !== 'object' || v === null) return;
  if ((v as { type?: string }).type === 'doc') return; // rich text: visited as a whole
  if (Array.isArray(v))
    for (const [i, x] of v.entries()) walk(x, path ? `${path}.${i}` : String(i), visit);
  else
    for (const [k, x] of Object.entries(v as Record<string, unknown>))
      walk(x, path ? `${path}.${k}` : k, visit);
}

/** Measured transfer sizes reported by the preview iframe (Resource Timing). */
export type PageWeight = {
  html: number;
  css: number;
  js: number;
  fonts: number;
  images: number;
  other: number;
  total: number;
  requests: number;
};
export function formatKb(bytes: number): string {
  return bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
      ? `${Math.round(bytes / 1024)} KB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
