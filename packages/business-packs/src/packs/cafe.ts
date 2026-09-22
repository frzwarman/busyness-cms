import type { BusinessPack } from '../types.ts';

export const cafe: BusinessPack = {
  id: 'cafe',
  name: 'Café',
  description: 'Coffee, pastry and a place to sit. Menu, hours and beans to take home.',
  icon: 'coffee',
  suggestedPreset: 'editorial',
  structuredDataType: 'Restaurant',
  homeSections: [
    'hero',
    'image-text',
    'menu',
    'testimonials',
    'business-hours',
    'locations',
    'faq',
    'cta',
  ],
  suggestedPages: [
    {
      key: 'home',
      title: 'Home',
      slug: '/',
      recipe: 'home',
      description: 'Story, menu highlights, hours and reviews.',
      recommended: true,
    },
    {
      key: 'menu',
      title: 'Menu',
      slug: '/menu',
      recipe: 'show-menu',
      description: 'Coffee, pastry and brunch with prices.',
      recommended: true,
    },
    {
      key: 'about',
      title: 'About',
      slug: '/about',
      recipe: 'build-trust',
      description: 'The roastery, the team, the beans.',
      recommended: true,
    },
    {
      key: 'gallery',
      title: 'Gallery',
      slug: '/gallery',
      recipe: 'gallery',
      description: 'The space and the cups.',
      recommended: false,
    },
    {
      key: 'contact',
      title: 'Contact',
      slug: '/contact',
      recipe: 'contact',
      description: 'Form, address and hours.',
      recommended: true,
    },
  ],
  forms: [],
  vocabulary: { offerings: 'Menu', primaryAction: 'Find us' },
  content: {
    hero: {
      eyebrow: 'Open daily from 07:00',
      heading: 'Coffee worth slowing down for',
      description:
        'Single-origin beans roasted in small batches, pastries baked before sunrise, and a corner table with your name on it.',
      primaryCta: 'Find us',
      secondaryCta: 'See the menu',
    },
    about: {
      eyebrow: 'Our story',
      heading: 'Roasted here, poured here',
      body: 'We started as a two-seat window bar and grew into the neighbourhood living room.\n\nEvery bean we serve comes from farms we have visited in Gayo, Toraja and Kintamani. We roast weekly, so nothing on the shelf is older than ten days.',
    },
    features: [
      {
        icon: 'coffee',
        title: 'Roasted weekly',
        description: 'Small batches, dated bags, never older than ten days.',
      },
      {
        icon: 'leaf',
        title: 'Farms we know',
        description: 'Direct relationships in Gayo, Toraja and Kintamani.',
      },
      {
        icon: 'heart',
        title: 'A room to stay in',
        description: 'Fast wifi, slow mornings, no laptop shaming.',
      },
    ],
    services: [
      {
        title: 'Espresso bar',
        description: 'Flat whites, long blacks and a rotating single origin.',
        price: 'from 28k',
      },
      {
        title: 'Brunch',
        description: 'Sourdough, eggs and pandan French toast until two.',
        price: 'from 48k',
      },
      {
        title: 'Beans & subscriptions',
        description: 'Weekly or fortnightly delivery within the city.',
        price: 'from 120k / 250g',
      },
    ],
    process: [
      {
        title: 'Pick a bean',
        description: 'The board lists what we roasted this week and how it tastes.',
      },
      { title: 'Choose how', description: 'Espresso, filter or cold brew; we grind to order.' },
      {
        title: 'Take some home',
        description: 'Bags on the shelf, or set up a subscription at the counter.',
      },
    ],
    stats: [
      { value: '10 days', label: 'Max roast age' },
      { value: '4.9', label: 'Google rating', description: '800+ reviews' },
      { value: '3', label: 'Origins on rotation' },
    ],
    testimonials: [
      {
        quote: 'The best flat white in town, and they remember your name.',
        name: 'Dewi P.',
        role: 'Google review',
        rating: 5,
      },
      {
        quote: 'We hold our weekly team breakfast here. Reliable, calm, delicious.',
        name: 'Arif S.',
        role: 'Founder, Pajajaran Studio',
        rating: 5,
      },
      {
        quote: 'Their beans made my home coffee routine finally taste right.',
        name: 'Lina K.',
        role: 'Subscriber',
        rating: 4,
      },
    ],
    faq: [
      {
        question: 'Do you take reservations?',
        answer: 'For groups of six or more, yes. Smaller groups can walk in any time.',
      },
      {
        question: 'Is there parking nearby?',
        answer: 'Street parking out front and a paid lot two doors down.',
      },
      {
        question: 'Do you sell beans to take home?',
        answer: 'Yes. Ask at the counter for this week’s roast, or set up a delivery subscription.',
      },
      {
        question: 'Can I work from the café?',
        answer: 'Please do. Wifi is fast and the corner tables have power.',
      },
    ],
    cta: {
      eyebrow: 'Open daily 07:00 – 21:00',
      heading: 'Book the corner table',
      description: 'Groups of six or more can reserve ahead. Walk-ins are always welcome.',
      label: 'Get in touch',
    },
    team: [
      {
        name: 'Rani Pratama',
        role: 'Head roaster',
        bio: 'Q-grader, ten years between Toraja and Gayo.',
      },
      { name: 'Bayu Santoso', role: 'Head barista', bio: 'Latte-art champion, Jakarta 2024.' },
      {
        name: 'Maya Lestari',
        role: 'Pastry',
        bio: 'Up at four so the croissants are ready by seven.',
      },
    ],
    hours: [
      { day: 'Monday – Friday', open: '07:00', close: '21:00' },
      { day: 'Saturday', open: '08:00', close: '22:00' },
      { day: 'Sunday', open: '08:00', close: '20:00' },
    ],
    menu: [
      {
        title: 'Coffee',
        items: [
          { name: 'Flat white', description: 'Double ristretto, silky milk', price: '32k' },
          {
            name: 'Pour over',
            description: 'Single origin, rotates weekly',
            price: '38k',
            tags: 'V',
          },
          { name: 'Es kopi susu', description: 'Our take on the classic', price: '28k' },
        ],
      },
      {
        title: 'Pastry & brunch',
        items: [
          { name: 'Butter croissant', description: 'Laminated overnight', price: '24k', tags: 'V' },
          { name: 'Pandan roll', description: 'Coconut glaze', price: '22k', tags: 'V' },
          {
            name: 'Sourdough eggs',
            description: 'Two eggs, herbs, sambal butter',
            price: '58k',
            tags: 'V',
          },
        ],
      },
    ],
  },
};
