import type { BusinessPack } from '../types.ts';

export const agency: BusinessPack = {
  id: 'agency',
  name: 'Creative agency',
  description: 'Work, services and a clear way to start a project.',
  icon: 'sparkles',
  suggestedPreset: 'minimal',
  structuredDataType: 'ProfessionalService',
  homeSections: ['hero', 'portfolio', 'services', 'process', 'testimonials', 'stats', 'cta'],
  suggestedPages: [
    {
      key: 'home',
      title: 'Home',
      slug: '/',
      recipe: 'home',
      description: 'Selected work, services, process and proof.',
      recommended: true,
    },
    {
      key: 'work',
      title: 'Work',
      slug: '/work',
      recipe: 'show-portfolio',
      description: 'Case studies and projects.',
      recommended: true,
    },
    {
      key: 'services',
      title: 'Services',
      slug: '/services',
      recipe: 'sell-service',
      description: 'What you do and how engagements run.',
      recommended: true,
    },
    {
      key: 'about',
      title: 'About',
      slug: '/about',
      recipe: 'build-trust',
      description: 'Team, values, numbers.',
      recommended: true,
    },
    {
      key: 'careers',
      title: 'Careers',
      slug: '/careers',
      recipe: 'recruit',
      description: 'Open roles and how to apply.',
      recommended: false,
    },
    {
      key: 'contact',
      title: 'Start a project',
      slug: '/contact',
      recipe: 'generate-leads',
      description: 'Brief form and next steps.',
      recommended: true,
    },
  ],
  forms: ['quote', 'job'],
  vocabulary: { offerings: 'Services', primaryAction: 'Start a project' },
  content: {
    hero: {
      eyebrow: 'Brand, web and campaign work',
      heading: 'Design that earns attention and keeps it',
      description:
        'We build brands and websites for companies that want to be remembered for the right reasons. Small team, senior people, no hand-offs.',
      primaryCta: 'Start a project',
      secondaryCta: 'See our work',
    },
    about: {
      eyebrow: 'Studio',
      heading: 'Eight people, one room, no account managers',
      body: 'You talk to the people who do the work. That is the whole model.\n\nWe have shipped brands for restaurants and rebrands for banks, and the process is the same: understand the business, find the one true thing, make it unmissable.',
    },
    features: [
      {
        icon: 'sparkles',
        title: 'Strategy first',
        description: 'Positioning and messaging before a single pixel.',
      },
      {
        icon: 'zap',
        title: 'Fast, senior teams',
        description: 'Three people who have done it before, not ten who are learning.',
      },
      {
        icon: 'trending-up',
        title: 'Measured outcomes',
        description: 'We agree what success looks like and report against it.',
      },
    ],
    services: [
      {
        title: 'Brand identity',
        description: 'Naming, logo, voice and a system your team can actually use.',
        price: 'from 45M',
      },
      {
        title: 'Websites',
        description: 'Design and build on a CMS your marketing team can run.',
        price: 'from 60M',
      },
      {
        title: 'Campaigns',
        description: 'Concept, content and media for launches and seasons.',
        price: 'from 30M',
      },
      {
        title: 'Retainers',
        description: 'A design team on call, billed monthly.',
        price: 'from 15M / month',
      },
    ],
    process: [
      { title: 'Discovery', description: 'Two weeks of interviews, audits and a written brief.' },
      { title: 'Design', description: 'Weekly reviews. You see everything, early.' },
      { title: 'Launch and learn', description: 'We ship, measure, and iterate for a month.' },
    ],
    stats: [
      { value: '140+', label: 'Projects shipped' },
      { value: '9', label: 'Years in business' },
      { value: '86%', label: 'Clients who come back' },
    ],
    testimonials: [
      {
        quote: 'They made our brand feel like it finally matched the quality of what we do.',
        name: 'Nadia R.',
        role: 'CEO, Botanic Café Group',
        rating: 5,
      },
      {
        quote: 'The website paid for itself in three months of leads.',
        name: 'Gilang W.',
        role: 'Founder, Sentul Cyclists',
        rating: 5,
      },
      {
        quote: 'Sharp thinking, calm process, no surprises on the invoice.',
        name: 'Priya T.',
        role: 'Marketing lead, Fintech',
        rating: 5,
      },
    ],
    faq: [
      {
        question: 'How long does a brand project take?',
        answer: 'Eight to twelve weeks from kickoff to delivered system, depending on scope.',
      },
      {
        question: 'Do you work with startups?',
        answer: 'Yes, often. We have a fixed-scope package for companies before their first raise.',
      },
      { question: 'Who owns the work?', answer: 'You do, fully, once the final invoice is paid.' },
    ],
    cta: {
      eyebrow: 'Currently booking',
      heading: 'Have a project in mind?',
      description:
        'Tell us about it in five sentences. We reply within two working days with honest thoughts on fit and budget.',
      label: 'Start a project',
    },
    team: [
      {
        name: 'Adi Nugroho',
        role: 'Creative director',
        bio: 'Ex-agency in Singapore, back home to build something smaller and better.',
      },
      {
        name: 'Sinta Dewi',
        role: 'Design lead',
        bio: 'Typography obsessive. Judges a brand by its footer.',
      },
      {
        name: 'Fajar Hakim',
        role: 'Technical director',
        bio: 'Builds sites that load fast and are easy to change.',
      },
    ],
    hours: [],
    portfolio: [
      { title: 'Botanic Café Group rebrand', category: 'Brand identity' },
      { title: 'Sentul Cyclists e-commerce', category: 'Website' },
      { title: 'Kopi Nusantara launch', category: 'Campaign' },
      { title: 'Harbour Clinic patient portal', category: 'Product design' },
    ],
    careers: {
      heading: 'Do the best work of your career, then go home on time',
      description: 'We are hiring a mid-level designer and a front-end developer.',
      perks: [
        { icon: 'clock', title: 'Four-day weeks', description: 'Fridays are yours, every week.' },
        {
          icon: 'trending-up',
          title: 'Real ownership',
          description: 'You lead projects, not slides.',
        },
        {
          icon: 'globe',
          title: 'Work anywhere',
          description: 'Studio days Tuesday and Thursday; the rest is up to you.',
        },
      ],
    },
  },
};
