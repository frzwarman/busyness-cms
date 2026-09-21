# Business packs and page recipes (Milestone 8 design)

A **business pack** is a deterministic set of suggestions, never restrictions:

```ts
{
  id: 'restaurant',
  name: 'Restaurant',
  suggestedTheme: 'editorial',
  suggestedPages: ['Home', 'Menu', 'About', 'Gallery', 'Contact'],
  suggestedSections: { Home: ['hero', 'menu-featured', 'hours', 'locations', 'reviews', 'gallery', 'cta'] },
  structuredData: 'Restaurant',
}
```

Packs: Restaurant, Cafe, Agency, SaaS, Law Firm, Clinic, Barbershop, Gym, Hotel, Real Estate, Photographer,
Freelancer, Construction, Automotive, Wedding/Event, Generic.

A **page recipe** answers "what should this page accomplish?" (Generate leads, Sell a service, Explain pricing,
Show portfolio, Build trust, Collect bookings, Promote event, Show menu, Recruit, Contact) with an ordered list
of section types created with defaults. Recipes reuse `registry.create()`; the result is ordinary editable
content with no link back to the recipe.

Section definitions already carry `recommendedFor` so the picker can surface pack-relevant sections first.
No AI is involved.
