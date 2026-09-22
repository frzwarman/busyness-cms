import type { BusinessPack } from '../types.ts';

export const wedding: BusinessPack = {
  id: 'wedding',
  name: 'Wedding & event planner',
  description: 'Packages, past events, process and an enquiry form.',
  icon: 'heart',
  suggestedPreset: 'organic',
  structuredDataType: 'ProfessionalService',
  homeSections: [
    'hero',
    'image-text',
    'services',
    'portfolio',
    'process',
    'testimonials',
    'faq',
    'cta',
  ],
  suggestedPages: [
    {
      key: 'home',
      title: 'Home',
      slug: '/',
      recipe: 'home',
      description: 'Approach, packages, past events.',
      recommended: true,
    },
    {
      key: 'work',
      title: 'Weddings',
      slug: '/weddings',
      recipe: 'show-portfolio',
      description: 'Real weddings and events.',
      recommended: true,
    },
    {
      key: 'services',
      title: 'Packages',
      slug: '/packages',
      recipe: 'sell-service',
      description: 'Planning options explained.',
      recommended: true,
    },
    {
      key: 'about',
      title: 'About',
      slug: '/about',
      recipe: 'build-trust',
      description: 'The planners and the philosophy.',
      recommended: false,
    },
    {
      key: 'contact',
      title: 'Enquire',
      slug: '/enquire',
      recipe: 'generate-leads',
      description: 'Date check and enquiry.',
      recommended: true,
    },
  ],
  forms: ['quote'],
  vocabulary: { offerings: 'Packages', primaryAction: 'Check your date' },
  content: {
    hero: {
      eyebrow: 'Weddings · Engagements · Celebrations',
      heading: 'A day that feels like you, run by people who have done this 200 times',
      description:
        'From a garden ceremony for forty to a two-day celebration for six hundred. We handle the vendors, the timeline and the weather plan so you can be a guest at your own wedding.',
      primaryCta: 'Check your date',
      secondaryCta: 'See real weddings',
    },
    about: {
      eyebrow: 'The studio',
      heading: 'Calm is the whole service',
      body: 'We are a team of four planners who have run more than two hundred weddings across Java and Bali. We know which florists deliver at dawn and which venues flood in December.\n\nOur job is to make the day feel effortless. Yours is to enjoy it.',
    },
    features: [
      {
        icon: 'calendar',
        title: 'One timeline, everyone on it',
        description: 'Vendors, family and the venue work from the same minute-by-minute plan.',
      },
      {
        icon: 'users',
        title: 'Vendors we have worked with',
        description: 'A trusted list built over two hundred events, at negotiated rates.',
      },
      {
        icon: 'shield',
        title: 'A plan B for everything',
        description: 'Rain, traffic, a late cake. We have seen it and we have a plan.',
      },
    ],
    services: [
      {
        title: 'Full planning',
        description:
          'From venue search to the last dance, twelve months of planning and the day itself.',
        price: 'from 45M',
      },
      {
        title: 'Partial planning',
        description: 'You have the big pieces; we finish the puzzle and run the day.',
        price: 'from 25M',
      },
      {
        title: 'Day-of coordination',
        description: 'We take your plan and make it happen while you enjoy it.',
        price: 'from 12M',
      },
    ],
    process: [
      { title: 'Meet', description: 'A conversation about the two of you, not a sales pitch.' },
      {
        title: 'Design and book',
        description: 'Venue, vendors, budget tracker and a shared plan.',
      },
      { title: 'The day', description: 'Two planners on site from setup to send-off.' },
    ],
    stats: [
      { value: '200+', label: 'Weddings planned' },
      { value: '4', label: 'Planners' },
      { value: '60', label: 'Trusted vendors' },
    ],
    testimonials: [
      {
        quote: 'It rained for an hour and we never knew. That is how good they are.',
        name: 'Sinta & Arya',
        role: 'Garden wedding, Bogor',
        rating: 5,
      },
      {
        quote: 'They kept 600 guests, two families and a very strict grandmother happy.',
        name: 'Putri & Kevin',
        role: 'Two-day celebration',
        rating: 5,
      },
      {
        quote:
          'Day-of coordination was the best money we spent. We were guests at our own wedding.',
        name: 'Laura & Made',
        role: 'Bali',
        rating: 5,
      },
    ],
    faq: [
      {
        question: 'How far ahead should we book?',
        answer:
          'Full planning works best with nine to twelve months. Day-of coordination can be booked with three.',
      },
      {
        question: 'Do you have set vendors?',
        answer:
          'We have a trusted list but you are never locked in. We work happily with vendors you bring.',
      },
      {
        question: 'What areas do you cover?',
        answer: 'Jakarta, Bogor, Bandung and Bali regularly; elsewhere by arrangement.',
      },
    ],
    cta: {
      eyebrow: 'A limited number of weddings each season',
      heading: 'Check your date',
      description: 'Tell us when and roughly how many. We reply within two days.',
      label: 'Check your date',
    },
    team: [
      {
        name: 'Ayu Pramesti',
        role: 'Founder · Lead planner',
        bio: 'Two hundred weddings, one philosophy: calm is contagious.',
      },
      {
        name: 'Nadia Halim',
        role: 'Planner',
        bio: 'Budgets, timelines and the family seating chart.',
      },
    ],
    hours: [],
    portfolio: [
      { title: 'Sinta & Arya, garden ceremony', category: 'Wedding · 120 guests' },
      { title: 'Putri & Kevin, two-day celebration', category: 'Wedding · 600 guests' },
      { title: 'Laura & Made, beachside', category: 'Wedding · Bali' },
      { title: 'Loka Ceramics tenth anniversary', category: 'Corporate event' },
    ],
  },
};
