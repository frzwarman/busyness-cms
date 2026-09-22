import type { BusinessPack } from '../types.ts';

export const saas: BusinessPack = {
  id: 'saas',
  name: 'Software product',
  description: 'Features, pricing, proof and a trial or demo request.',
  icon: 'zap',
  suggestedPreset: 'modern',
  structuredDataType: 'Organization',
  homeSections: [
    'hero',
    'stats',
    'feature-grid',
    'image-text',
    'testimonials',
    'pricing',
    'faq',
    'cta',
  ],
  suggestedPages: [
    {
      key: 'home',
      title: 'Home',
      slug: '/',
      recipe: 'home',
      description: 'Value proposition, features, proof, pricing.',
      recommended: true,
    },
    {
      key: 'pricing',
      title: 'Pricing',
      slug: '/pricing',
      recipe: 'explain-pricing',
      description: 'Plans, comparison and questions.',
      recommended: true,
    },
    {
      key: 'feature-grid',
      title: 'Features',
      slug: '/features',
      recipe: 'sell-service',
      description: 'Deep dive into what the product does.',
      recommended: true,
    },
    {
      key: 'about',
      title: 'About',
      slug: '/about',
      recipe: 'build-trust',
      description: 'Mission, team, traction.',
      recommended: false,
    },
    {
      key: 'careers',
      title: 'Careers',
      slug: '/careers',
      recipe: 'recruit',
      description: 'Open roles.',
      recommended: false,
    },
    {
      key: 'contact',
      title: 'Book a demo',
      slug: '/demo',
      recipe: 'generate-leads',
      description: 'Demo request form.',
      recommended: true,
    },
  ],
  forms: ['quote'],
  vocabulary: { offerings: 'Features', primaryAction: 'Book a demo' },
  content: {
    hero: {
      eyebrow: 'Scheduling for service teams',
      heading: 'Stop losing jobs to missed calls',
      description:
        'Rostr books, confirms and reminds your customers automatically, so your technicians spend the day fixing things instead of phoning about them.',
      primaryCta: 'Book a demo',
      secondaryCta: 'See pricing',
    },
    about: {
      eyebrow: 'Why we built it',
      heading: 'We ran a plumbing company. The phone never stopped.',
      body: 'Rostr started as a spreadsheet in a van. Now 1,400 service businesses use it to book 60,000 jobs a month.\n\nEvery feature comes from a real dispatcher’s problem: double bookings, no-shows, the 6 pm “is he still coming?” call.',
    },
    features: [
      {
        icon: 'calendar',
        title: 'Online booking',
        description: 'Customers pick a slot that fits your real roster.',
      },
      {
        icon: 'phone',
        title: 'Automatic reminders',
        description: 'SMS and WhatsApp the day before. No-shows drop by half.',
      },
      {
        icon: 'map-pin',
        title: 'Route-aware scheduling',
        description: 'Jobs are grouped by area so nobody drives across town twice.',
      },
    ],
    services: [
      {
        title: 'Booking page',
        description: 'A branded page customers can book from without calling.',
        price: 'All plans',
      },
      {
        title: 'Dispatcher board',
        description: 'Drag, drop and reassign the day in seconds.',
        price: 'All plans',
      },
      {
        title: 'Invoicing',
        description: 'Quote on site, invoice from the van, get paid by link.',
        price: 'Growth and up',
      },
    ],
    process: [
      { title: 'Import your customers', description: 'Upload a spreadsheet; we clean it up.' },
      { title: 'Set your roster', description: 'Who works when, where, and on what.' },
      {
        title: 'Share your booking link',
        description: 'Customers book, Rostr confirms and reminds.',
      },
    ],
    stats: [
      { value: '1,400+', label: 'Service businesses' },
      { value: '60k', label: 'Jobs booked monthly' },
      { value: '52%', label: 'Fewer no-shows', description: 'average after 90 days' },
    ],
    testimonials: [
      {
        quote: 'We took on two more technicians without hiring another dispatcher.',
        name: 'Hendra W.',
        role: 'Owner, HW Cooling',
        rating: 5,
      },
      {
        quote: 'Reminders alone paid for the subscription in the first week.',
        name: 'Ayu L.',
        role: 'Manager, Klinik Sehat',
        rating: 5,
      },
      {
        quote: 'The first software our field team actually kept using.',
        name: 'Rudi P.',
        role: 'Operations, Sanitas Pest Control',
        rating: 4,
      },
    ],
    faq: [
      {
        question: 'Is there a free trial?',
        answer: 'Fourteen days, no card needed. Import your data and book real jobs.',
      },
      {
        question: 'Can I cancel any time?',
        answer: 'Yes. Monthly plans stop at the end of the period; we export your data on request.',
      },
      {
        question: 'Does it work on phones?',
        answer:
          'Technicians use the mobile app; dispatchers use the web board. Both work offline for short stretches.',
      },
      {
        question: 'Do you offer onboarding?',
        answer:
          'Every plan includes a 45-minute setup call. Business plans include a dedicated success manager.',
      },
    ],
    cta: {
      eyebrow: 'Fourteen-day free trial',
      heading: 'See Rostr with your own roster',
      description: 'A 20-minute demo with a real dispatcher, not a sales deck.',
      label: 'Book a demo',
    },
    team: [
      {
        name: 'Dian Kusuma',
        role: 'Co-founder, CEO',
        bio: 'Ran a 12-van plumbing company for eight years before writing a line of code.',
      },
      {
        name: 'Farhan Malik',
        role: 'Co-founder, CTO',
        bio: 'Previously built dispatch systems for a logistics unicorn.',
      },
    ],
    hours: [],
    pricing: [
      {
        name: 'Starter',
        price: 'Rp 490k',
        period: '/ month',
        description: 'One team, up to 5 technicians.',
        features: ['Online booking page', 'Dispatcher board', 'SMS reminders', 'Email support'],
      },
      {
        name: 'Growth',
        price: 'Rp 1.2M',
        period: '/ month',
        description: 'Up to 20 technicians.',
        features: [
          'Everything in Starter',
          'WhatsApp reminders',
          'Invoicing and payments',
          'Route-aware scheduling',
          'Priority support',
        ],
        highlighted: true,
        badge: 'Most popular',
      },
      {
        name: 'Business',
        price: 'Let’s talk',
        period: '',
        description: 'Multiple branches and integrations.',
        features: [
          'Everything in Growth',
          'Multi-branch',
          'API access',
          'Dedicated success manager',
        ],
      },
    ],
    careers: {
      heading: 'Build software for people who fix things',
      description: 'Hiring product engineers and a customer success lead in Jakarta and remote.',
      perks: [
        {
          icon: 'globe',
          title: 'Remote-first',
          description: 'Two team weeks a year, the rest wherever you work best.',
        },
        {
          icon: 'trending-up',
          title: 'Equity for everyone',
          description: 'Every full-time hire owns part of the company.',
        },
        {
          icon: 'heart',
          title: 'Health cover',
          description: 'For you and your family, from day one.',
        },
      ],
    },
  },
};
