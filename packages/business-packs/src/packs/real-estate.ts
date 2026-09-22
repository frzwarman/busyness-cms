import type { BusinessPack } from '../types.ts';

export const realEstate: BusinessPack = {
  id: 'real-estate',
  name: 'Real estate',
  description: 'Listings, services, agents and a valuation request.',
  icon: 'home',
  suggestedPreset: 'corporate',
  structuredDataType: 'ProfessionalService',
  homeSections: [
    'hero',
    'services',
    'portfolio',
    'stats',
    'process',
    'team',
    'testimonials',
    'cta',
  ],
  suggestedPages: [
    {
      key: 'home',
      title: 'Home',
      slug: '/',
      recipe: 'home',
      description: 'Services, featured listings, agents.',
      recommended: true,
    },
    {
      key: 'work',
      title: 'Listings',
      slug: '/listings',
      recipe: 'show-portfolio',
      description: 'Current properties.',
      recommended: true,
    },
    {
      key: 'services',
      title: 'Sell with us',
      slug: '/sell',
      recipe: 'sell-service',
      description: 'How selling works and what it costs.',
      recommended: true,
    },
    {
      key: 'about',
      title: 'Agents',
      slug: '/agents',
      recipe: 'build-trust',
      description: 'The team and track record.',
      recommended: false,
    },
    {
      key: 'contact',
      title: 'Free valuation',
      slug: '/valuation',
      recipe: 'generate-leads',
      description: 'Request a valuation.',
      recommended: true,
    },
  ],
  forms: ['quote'],
  vocabulary: { offerings: 'Services', primaryAction: 'Get a free valuation' },
  content: {
    hero: {
      eyebrow: 'Sales · Rentals · Management',
      heading: 'Sell for more, with less noise',
      description:
        'Local agents who price honestly, photograph properly and negotiate hard. Most of our listings sell within six weeks.',
      primaryCta: 'Get a free valuation',
      secondaryCta: 'Browse listings',
    },
    about: {
      eyebrow: 'The agency',
      heading: 'Fifteen years on the same streets',
      body: 'We have sold or let more than 900 homes within five kilometres of the office. That is the whole advantage: we know which streets flood, which schools fill up and what a buyer will really pay.\n\nOne agent handles your sale from valuation to keys.',
    },
    features: [
      {
        icon: 'camera',
        title: 'Professional photos and video',
        description: 'Every listing, included in the fee.',
      },
      {
        icon: 'trending-up',
        title: 'Honest pricing',
        description: 'We show you the comparable sales, not a flattering number.',
      },
      {
        icon: 'phone',
        title: 'One agent, start to finish',
        description: 'No hand-offs. The person who values your home sells it.',
      },
    ],
    services: [
      {
        title: 'Selling',
        description: 'Valuation, marketing, viewings, negotiation and completion.',
        price: '2% of sale price',
      },
      {
        title: 'Letting',
        description: 'Tenant finding, referencing and contracts.',
        price: 'One month’s rent',
      },
      {
        title: 'Property management',
        description: 'Rent collection, maintenance and inspections.',
        price: '8% of rent',
      },
      {
        title: 'Buying advice',
        description: 'Off-market access and negotiation for buyers.',
        price: '1% of purchase',
      },
    ],
    process: [
      { title: 'Valuation', description: 'A free visit and a written report with comparables.' },
      {
        title: 'Marketing',
        description: 'Photos, video, floor plan and launch to our buyer list first.',
      },
      {
        title: 'Sale',
        description: 'Accompanied viewings, negotiation and a hand on the paperwork.',
      },
    ],
    stats: [
      { value: '900+', label: 'Homes sold or let' },
      { value: '6 weeks', label: 'Median time to sell' },
      { value: '98%', label: 'Of asking price achieved' },
    ],
    testimonials: [
      {
        quote: 'Sold in nineteen days, over asking, and the photos made me want to buy it back.',
        name: 'Dian & Rafi',
        role: 'Sellers',
        rating: 5,
      },
      {
        quote:
          'They found us tenants in a week and have managed the flat for three years without a single headache.',
        name: 'Mr. Soetanto',
        role: 'Landlord',
        rating: 5,
      },
      {
        quote:
          'Told us to walk away from a deal that would have cost us. We trust them completely.',
        name: 'Maria L.',
        role: 'Buyer',
        rating: 5,
      },
    ],
    faq: [
      {
        question: 'What does a valuation cost?',
        answer:
          'Nothing. A visit takes about forty minutes and you receive a written report within two days.',
      },
      {
        question: 'Are there upfront fees?',
        answer: 'No. Our fee is paid on completion of the sale.',
      },
      {
        question: 'How do you market a property?',
        answer:
          'Professional photography and video, all the major portals, and our own list of 3,000 registered buyers first.',
      },
    ],
    cta: {
      eyebrow: 'No obligation',
      heading: 'Find out what your home is worth',
      description: 'A free valuation from an agent who has sold on your street.',
      label: 'Get a free valuation',
    },
    team: [
      {
        name: 'Andini Rahayu',
        role: 'Director · Sales',
        bio: 'Fifteen years in the area and the agent most likely to know your neighbours.',
      },
      {
        name: 'Bagus Setiawan',
        role: 'Lettings manager',
        bio: 'Looks after 140 rental homes and their landlords.',
      },
    ],
    hours: [
      { day: 'Monday – Friday', open: '09:00', close: '18:00' },
      { day: 'Saturday', open: '09:00', close: '14:00' },
    ],
    portfolio: [
      { title: 'Three-bed villa, Sentul', category: 'For sale · Rp 3.2B' },
      { title: 'Two-bed apartment, city centre', category: 'For sale · Rp 1.1B' },
      { title: 'Family home with garden, Pajajaran', category: 'To let · Rp 18M / month' },
      { title: 'Studio near the station', category: 'To let · Rp 6M / month' },
    ],
  },
};
