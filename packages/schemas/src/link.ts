import { z } from 'zod';

/**
 * Typed links. Internal links reference page ids so slug changes never break them;
 * the renderer resolves the current slug at render time.
 */
export const linkSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('page'), pageId: z.string().min(1), anchor: z.string().optional() }),
  z.object({
    kind: z.literal('url'),
    href: z.url({ protocol: /^https?$/ }),
    newTab: z.boolean().default(false),
  }),
  z.object({ kind: z.literal('email'), email: z.email() }),
  z.object({ kind: z.literal('phone'), phone: z.string().min(3).max(32) }),
  z.object({ kind: z.literal('anchor'), anchor: z.string().min(1) }),
]);
export type Link = z.infer<typeof linkSchema>;

export const buttonSchema = z.object({
  label: z.string().min(1).max(80),
  link: linkSchema,
  style: z.enum(['filled', 'outline', 'text']).default('filled'),
});
export type Button = z.infer<typeof buttonSchema>;

export type LinkResolver = { slugForPage(pageId: string): string | undefined };

/** Resolve a typed link to an href. Returns undefined when the target page no longer exists. */
export function resolveLink(link: Link, resolver: LinkResolver): string | undefined {
  switch (link.kind) {
    case 'page': {
      const slug = resolver.slugForPage(link.pageId);
      if (slug === undefined) return undefined;
      return link.anchor ? `${slug}#${link.anchor}` : slug;
    }
    case 'url':
      return link.href;
    case 'email':
      return `mailto:${link.email}`;
    case 'phone':
      return `tel:${link.phone.replace(/[^\d+]/g, '')}`;
    case 'anchor':
      return `#${link.anchor}`;
  }
}
