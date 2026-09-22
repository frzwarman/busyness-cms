# Business packs, page recipes and guided creation

Everything here produces **ordinary editable records**. Nothing keeps a reference to the pack afterwards.

## Business packs (`packages/business-packs/src/packs/*`)

Sixteen packs: Restaurant, Café, Creative agency, Software product, Law firm, Clinic, Barbershop, Gym, Hotel,
Real estate, Photographer, Freelancer, Construction, Automotive, Wedding planner, Other business. A pack is data:

| Field | Purpose |
|-------|---------|
| `suggestedPreset` | Theme preset preselected in the wizard (changeable) |
| `structuredDataType` | Prefills Site settings → Structured data |
| `homeSections` | Section types the home recipe lays out, in order (pack-specific composition) |
| `suggestedPages` | `{ key, title, slug, recipe, description, recommended }` — ticked by default when `recommended` |
| `forms` | Form templates created with the site (Contact is always created) |
| `content` | Real copy in the trade's voice: hero, about, features, services, process, stats, testimonials, FAQ, CTA, team, hours, and menu / pricing / portfolio / careers where they fit |

Copy is specific, plain and honest; a test forbids lorem ipsum. Prices are IDR placeholders the owner edits.

## Page recipes (`recipes.ts`)

Deterministic builders: Home, Generate leads, Sell a service, Explain pricing, Show portfolio, Build trust / About,
Collect bookings, Promote an event, Show menu, Recruit, Contact, Gallery, Blank. Each recipe assembles sections through
`registry.create(type, props)`, so every generated section is validated by its schema at build time — a copy error
fails the test suite, never a user.

Recipes take a `BuildContext`: the pack, the owner's `SiteDetails` (name, tagline, phone, email, street, city), page
ids for internal links (missing pages fall back to anchors/phone/email), form ids, and placeholder imagery. Forms are
built first so heroes and CTAs can anchor to the form on the same page.

## Guided creation (Studio `/new-site`)

1. Business type · 2. Details (name required) · 3. Style (suggested preset preselected) · 4. Colors (skippable) ·
5. Recommended pages (untick freely) · 6. Review and create.

`createSiteFromPack()` then creates the site and settings (structured data from the details), the forms, empty pages to
obtain ids, navbar and footer **as global sections** linking those pages, and finally each page's draft from its
recipe wrapped in the global placeholders. Progress is shown step by step; nothing is published.

## New page

Pages → New page asks "What should this page accomplish?" and builds the draft from the chosen recipe using the site's
business type and details (read back from Site settings), reusing the site's global navbar/footer.

## Section picker

Opens on **Recommended for you**: sections whose `recommendedFor` includes the site's business type (or `*`).

## Templates

A "template" is a pack plus a preset. Because creation writes plain records, switching theme later keeps content,
and deleting a page or global is just editing.
