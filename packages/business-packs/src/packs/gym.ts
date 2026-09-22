import type { BusinessPack } from '../types.ts';

export const gym: BusinessPack = {
  id: 'gym',
  name: 'Gym & fitness',
  description: 'Classes, memberships, coaches and a trial sign-up.',
  icon: 'dumbbell',
  suggestedPreset: 'modern',
  structuredDataType: 'LocalBusiness',
  homeSections: [
    'hero',
    'feature-grid',
    'services',
    'pricing',
    'team',
    'testimonials',
    'business-hours',
    'cta',
  ],
  suggestedPages: [
    {
      key: 'home',
      title: 'Home',
      slug: '/',
      recipe: 'home',
      description: 'Programs, memberships, coaches, hours.',
      recommended: true,
    },
    {
      key: 'pricing',
      title: 'Memberships',
      slug: '/memberships',
      recipe: 'explain-pricing',
      description: 'Plans and what is included.',
      recommended: true,
    },
    {
      key: 'services',
      title: 'Classes',
      slug: '/classes',
      recipe: 'sell-service',
      description: 'Every program explained.',
      recommended: true,
    },
    {
      key: 'about',
      title: 'Coaches',
      slug: '/coaches',
      recipe: 'build-trust',
      description: 'The team and the philosophy.',
      recommended: false,
    },
    {
      key: 'contact',
      title: 'Free trial',
      slug: '/trial',
      recipe: 'collect-bookings',
      description: 'Book a free first session.',
      recommended: true,
    },
  ],
  forms: ['booking'],
  vocabulary: { offerings: 'Programs', primaryAction: 'Book a free session' },
  content: {
    hero: {
      eyebrow: 'Strength · Conditioning · Mobility',
      heading: 'Train with people who know your name',
      description:
        'Small-group coaching, a floor that never feels crowded, and a plan that changes as you do. Your first session is free.',
      primaryCta: 'Book a free session',
      secondaryCta: 'See memberships',
    },
    about: {
      eyebrow: 'The gym',
      heading: 'Built for consistency, not for selfies',
      body: 'We cap classes at twelve so every rep gets seen. Coaches are full-time, not freelancers passing through.\n\nMost members have been with us for over two years. They stay because the results keep coming and the room feels like theirs.',
    },
    features: [
      {
        icon: 'users',
        title: 'Small groups',
        description: 'Twelve people max per class. Every rep gets coached.',
      },
      {
        icon: 'trending-up',
        title: 'A plan that adapts',
        description: 'Quarterly assessments and programming that follows your progress.',
      },
      {
        icon: 'clock',
        title: 'Classes from 06:00',
        description: 'Before work, at lunch, after work, weekends.',
      },
    ],
    services: [
      {
        title: 'Strength',
        description: 'Barbell fundamentals to advanced lifting, coached in small groups.',
        price: 'All memberships',
      },
      {
        title: 'Conditioning',
        description: 'Rowers, bikes, sleds and a stopwatch. Forty-five hard minutes.',
        price: 'All memberships',
      },
      {
        title: 'Mobility & recovery',
        description: 'Sunday sessions that keep you training on Monday.',
        price: 'All memberships',
      },
      {
        title: 'Personal training',
        description: 'One-to-one programming and sessions.',
        price: 'from 350k / session',
      },
    ],
    process: [
      {
        title: 'Free first session',
        description: 'Movement screen, goals, and a class on the house.',
      },
      {
        title: 'Your first month',
        description: 'Foundations classes so the barbell feels like a friend.',
      },
      { title: 'Assess and adjust', description: 'Every quarter we measure and re-plan.' },
    ],
    stats: [
      { value: '12', label: 'Max per class' },
      { value: '2.3 yrs', label: 'Average membership' },
      { value: '38', label: 'Classes a week' },
    ],
    testimonials: [
      {
        quote:
          'Down 14 kilos and deadlifting more than my husband. Coaches saw me through all of it.',
        name: 'Intan R.',
        role: 'Member since 2023',
        rating: 5,
      },
      {
        quote: 'The 06:00 class is the best decision I make every day.',
        name: 'Bima S.',
        role: 'Member',
        rating: 5,
      },
      {
        quote: 'No egos, no queues for the racks. Just good coaching.',
        name: 'Kevin L.',
        role: 'Member',
        rating: 5,
      },
    ],
    faq: [
      {
        question: 'I have never lifted. Is this for me?',
        answer:
          'Yes. Everyone starts with Foundations, four sessions that teach the basics safely.',
      },
      {
        question: 'Can I pause my membership?',
        answer: 'Once a year for up to a month, no questions asked.',
      },
      { question: 'Are there showers?', answer: 'Four showers, lockers and towels included.' },
    ],
    cta: {
      eyebrow: 'First session free',
      heading: 'Come and see for yourself',
      description: 'One class, no card, no pressure. Bring shoes and water.',
      label: 'Book a free session',
    },
    team: [
      {
        name: 'Coach Aldi',
        role: 'Head coach',
        bio: 'National-level weightlifting coach. Cares more about your technique than your ego.',
      },
      {
        name: 'Coach Nia',
        role: 'Conditioning',
        bio: 'Former rower. Makes forty-five minutes feel like a team sport.',
      },
      {
        name: 'Coach Reza',
        role: 'Mobility',
        bio: 'Physiotherapist by training. Keeps the whole gym moving well.',
      },
    ],
    hours: [
      { day: 'Monday – Friday', open: '06:00', close: '21:00' },
      { day: 'Saturday', open: '07:00', close: '15:00' },
      { day: 'Sunday', open: '08:00', close: '12:00' },
    ],
    pricing: [
      {
        name: 'Two a week',
        price: 'Rp 650k',
        period: '/ month',
        description: 'Eight classes a month.',
        features: ['Any class', 'Quarterly assessment', 'App booking'],
      },
      {
        name: 'Unlimited',
        price: 'Rp 950k',
        period: '/ month',
        description: 'Train as often as you like.',
        features: [
          'Unlimited classes',
          'Quarterly assessment',
          'Open gym hours',
          'One PT session a quarter',
        ],
        highlighted: true,
        badge: 'Most popular',
      },
      {
        name: 'Coaching',
        price: 'Rp 2.4M',
        period: '/ month',
        description: 'Unlimited classes plus weekly one-to-one.',
        features: ['Everything in Unlimited', 'Weekly PT session', 'Nutrition check-ins'],
      },
    ],
  },
};
