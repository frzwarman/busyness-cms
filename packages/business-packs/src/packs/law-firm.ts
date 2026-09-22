import type { BusinessPack } from '../types.ts';

export const lawFirm: BusinessPack = {
  id: 'law-firm',
  name: 'Law firm',
  description: 'Practice areas, attorneys, credentials and a consultation request.',
  icon: 'scale',
  suggestedPreset: 'corporate',
  structuredDataType: 'ProfessionalService',
  homeSections: ['hero', 'services', 'stats', 'image-text', 'team', 'testimonials', 'faq', 'cta'],
  suggestedPages: [
    {
      key: 'home',
      title: 'Home',
      slug: '/',
      recipe: 'home',
      description: 'Practice areas, attorneys, credentials.',
      recommended: true,
    },
    {
      key: 'services',
      title: 'Practice areas',
      slug: '/practice-areas',
      recipe: 'sell-service',
      description: 'Each area explained plainly.',
      recommended: true,
    },
    {
      key: 'about',
      title: 'Attorneys',
      slug: '/attorneys',
      recipe: 'build-trust',
      description: 'Profiles, experience, credentials.',
      recommended: true,
    },
    {
      key: 'contact',
      title: 'Consultation',
      slug: '/consultation',
      recipe: 'generate-leads',
      description: 'Request a consultation.',
      recommended: true,
    },
  ],
  forms: ['quote'],
  vocabulary: { offerings: 'Practice areas', primaryAction: 'Request a consultation' },
  content: {
    hero: {
      eyebrow: 'Corporate, property and family law',
      heading: 'Clear advice when the stakes are high',
      description:
        'We explain your options in plain language, tell you what it will cost before we start, and pick up the phone when you call.',
      primaryCta: 'Request a consultation',
      secondaryCta: 'Our practice areas',
    },
    about: {
      eyebrow: 'The firm',
      heading: 'Founded on the idea that clients deserve straight answers',
      body: 'Three partners, eleven lawyers, one standard: you always know where your matter stands and what it is costing.\n\nWe act for family businesses, property developers and individuals at the turning points of their lives.',
    },
    features: [
      {
        icon: 'check',
        title: 'Fixed fees where possible',
        description: 'Most matters are quoted up front. Hourly work is capped and reported weekly.',
      },
      {
        icon: 'clock',
        title: 'Same-day replies',
        description: 'Emails answered the day they arrive, even if the answer is “not yet”.',
      },
      {
        icon: 'shield',
        title: 'Senior attention',
        description: 'A partner is on every matter, not just on the letterhead.',
      },
    ],
    services: [
      {
        title: 'Corporate and commercial',
        description: 'Company formation, shareholder agreements, contracts and disputes.',
        price: 'Fixed fee or hourly',
      },
      {
        title: 'Property',
        description: 'Purchases, leases, development agreements and due diligence.',
        price: 'from 0.5% of value',
      },
      {
        title: 'Family',
        description: 'Prenuptial agreements, divorce, custody and inheritance.',
        price: 'Fixed-fee consultation',
      },
      {
        title: 'Employment',
        description: 'Contracts, terminations and disputes for employers and employees.',
        price: 'Fixed fee or hourly',
      },
    ],
    process: [
      {
        title: 'Initial consultation',
        description: 'Forty-five minutes to understand your situation and options.',
      },
      {
        title: 'Written plan and quote',
        description: 'What we will do, in what order, at what cost.',
      },
      { title: 'We act', description: 'Weekly updates, no surprises.' },
    ],
    stats: [
      { value: '22', label: 'Years established' },
      { value: '11', label: 'Lawyers' },
      { value: '2,300+', label: 'Matters concluded' },
    ],
    testimonials: [
      {
        quote: 'They turned a two-year dispute into a settlement in four months.',
        name: 'P. Hartono',
        role: 'Managing director, manufacturing',
        rating: 5,
      },
      {
        quote: 'Calm, precise, and honest about what was worth fighting for.',
        name: 'A. Wijaya',
        role: 'Family matter',
        rating: 5,
      },
      {
        quote: 'Our go-to for every lease and acquisition since 2019.',
        name: 'Sarah M.',
        role: 'Property developer',
        rating: 5,
      },
    ],
    faq: [
      {
        question: 'How much does a consultation cost?',
        answer:
          'A first consultation is a fixed fee, credited against your matter if you instruct us.',
      },
      {
        question: 'Do you offer fixed fees?',
        answer:
          'For most transactional work, yes. Litigation is estimated in stages and capped per stage.',
      },
      {
        question: 'Can we meet online?',
        answer: 'Yes. Most consultations happen by video; documents are signed electronically.',
      },
    ],
    cta: {
      eyebrow: 'Consultations this week',
      heading: 'Talk to a lawyer, not a form',
      description:
        'Tell us briefly what is happening. A partner will call you back within one working day.',
      label: 'Request a consultation',
    },
    team: [
      {
        name: 'Hendra Kusnadi, S.H., LL.M.',
        role: 'Managing partner · Corporate',
        bio: 'Twenty-two years advising family businesses through succession and sale.',
      },
      {
        name: 'Dewi Anggraini, S.H.',
        role: 'Partner · Property',
        bio: 'Has closed developments from apartments to industrial estates.',
      },
      {
        name: 'Michael Tan, S.H.',
        role: 'Partner · Family',
        bio: 'Known for settlements that keep families speaking to each other.',
      },
    ],
    hours: [{ day: 'Monday – Friday', open: '08:30', close: '17:30' }],
  },
};
