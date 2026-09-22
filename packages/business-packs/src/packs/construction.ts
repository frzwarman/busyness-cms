import type { BusinessPack } from '../types.ts';

export const construction: BusinessPack = {
  id: 'construction',
  name: 'Construction & trades',
  description: 'Services, completed projects, process and quote requests.',
  icon: 'wrench',
  suggestedPreset: 'corporate',
  structuredDataType: 'LocalBusiness',
  homeSections: ['hero', 'services', 'portfolio', 'process', 'stats', 'testimonials', 'faq', 'cta'],
  suggestedPages: [
    {
      key: 'home',
      title: 'Home',
      slug: '/',
      recipe: 'home',
      description: 'Services, projects, process, quote.',
      recommended: true,
    },
    {
      key: 'services',
      title: 'Services',
      slug: '/services',
      recipe: 'sell-service',
      description: 'What you build and repair.',
      recommended: true,
    },
    {
      key: 'work',
      title: 'Projects',
      slug: '/projects',
      recipe: 'show-portfolio',
      description: 'Completed work with details.',
      recommended: true,
    },
    {
      key: 'about',
      title: 'About',
      slug: '/about',
      recipe: 'build-trust',
      description: 'The company, the crew, the numbers.',
      recommended: false,
    },
    {
      key: 'contact',
      title: 'Get a quote',
      slug: '/quote',
      recipe: 'generate-leads',
      description: 'Quote request form.',
      recommended: true,
    },
  ],
  forms: ['quote'],
  vocabulary: { offerings: 'Services', primaryAction: 'Get a quote' },
  content: {
    hero: {
      eyebrow: 'Renovations · Extensions · Repairs',
      heading: 'Built right, on the date we said',
      description:
        'A licensed crew that turns up when promised, keeps the site clean and hands you a written schedule before we start. Fixed quotes, no surprises.',
      primaryCta: 'Get a quote',
      secondaryCta: 'See our projects',
    },
    about: {
      eyebrow: 'The company',
      heading: 'Second-generation builders, first-name basis',
      body: 'My father started with a pickup and two carpenters. We now run four crews, but every project still gets a site visit from a family member.\n\nWe specialise in renovations of older homes, where knowing what is behind the wall matters.',
    },
    features: [
      {
        icon: 'check',
        title: 'Fixed written quotes',
        description: 'Itemised, signed, and honoured unless you change the scope.',
      },
      {
        icon: 'calendar',
        title: 'A schedule you can hold us to',
        description: 'Week-by-week plan shared before day one.',
      },
      {
        icon: 'shield',
        title: 'Licensed and insured',
        description: 'Full public liability and a two-year workmanship guarantee.',
      },
    ],
    services: [
      {
        title: 'Kitchen and bathroom renovation',
        description: 'Design, demolition, plumbing, tiling and finishing.',
        price: 'from 45M',
      },
      {
        title: 'Extensions',
        description: 'Ground and first-floor additions with permits handled.',
        price: 'from 4.5M / m²',
      },
      {
        title: 'Roofing and waterproofing',
        description: 'Repairs, replacement and leak tracing.',
        price: 'from 350k / m²',
      },
      {
        title: 'General repairs',
        description: 'Doors, floors, cracks, drainage: the list that never ends.',
        price: 'from 750k / visit',
      },
    ],
    process: [
      { title: 'Site visit', description: 'We measure, look behind things and listen.' },
      {
        title: 'Quote and schedule',
        description: 'Itemised price and a week-by-week plan within five days.',
      },
      {
        title: 'Build and hand over',
        description: 'Daily clean-up, weekly photos, a final walk-through.',
      },
    ],
    stats: [
      { value: '320+', label: 'Projects completed' },
      { value: '2 yrs', label: 'Workmanship guarantee' },
      { value: '4', label: 'Full-time crews' },
    ],
    testimonials: [
      {
        quote: 'Finished the kitchen two days early and left it cleaner than they found it.',
        name: 'Ibu Ratna',
        role: 'Kitchen renovation',
        rating: 5,
      },
      {
        quote: 'The only quote that matched the final invoice. Exactly.',
        name: 'Pak Dedi',
        role: 'Extension',
        rating: 5,
      },
      {
        quote: 'Found the leak three others missed. Fixed for good.',
        name: 'Wina K.',
        role: 'Roof repair',
        rating: 5,
      },
    ],
    faq: [
      {
        question: 'Do you handle permits?',
        answer:
          'Yes, for extensions and structural work we prepare and submit the drawings and applications.',
      },
      {
        question: 'How long does a bathroom take?',
        answer: 'Typically two to three weeks from demolition to hand-over.',
      },
      {
        question: 'Can we live in the house during the work?',
        answer: 'For most renovations, yes. We seal off the work area and clean daily.',
      },
    ],
    cta: {
      eyebrow: 'Free site visits',
      heading: 'Get a fixed quote',
      description: 'Tell us about the job. We visit within the week and quote within five days.',
      label: 'Get a quote',
    },
    team: [
      {
        name: 'Agus Santoso',
        role: 'Director',
        bio: 'Thirty years on sites, still checks every level himself.',
      },
      {
        name: 'Rian Santoso',
        role: 'Project manager',
        bio: 'Runs the schedules, the crews and the weekly photo updates.',
      },
    ],
    hours: [{ day: 'Monday – Saturday', open: '07:30', close: '17:00' }],
    portfolio: [
      { title: 'Kitchen and dining renovation, Sentul', category: 'Renovation' },
      { title: 'Two-storey extension, Bogor Tengah', category: 'Extension' },
      { title: 'Roof replacement, 1970s villa', category: 'Roofing' },
      { title: 'Shop fit-out for a café', category: 'Commercial' },
    ],
  },
};
