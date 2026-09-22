import type { BusinessPack } from '../types.ts';

export const photographer: BusinessPack = {
  id: 'photographer',
  name: 'Photographer',
  description: 'Portfolio, packages and enquiry for weddings, portraits or commercial work.',
  icon: 'camera',
  suggestedPreset: 'minimal',
  structuredDataType: 'ProfessionalService',
  homeSections: ['hero', 'portfolio', 'services', 'image-text', 'testimonials', 'cta'],
  suggestedPages: [
    {
      key: 'home',
      title: 'Home',
      slug: '/',
      recipe: 'home',
      description: 'Portfolio, packages, about.',
      recommended: true,
    },
    {
      key: 'work',
      title: 'Portfolio',
      slug: '/portfolio',
      recipe: 'show-portfolio',
      description: 'Galleries by type of work.',
      recommended: true,
    },
    {
      key: 'pricing',
      title: 'Packages',
      slug: '/packages',
      recipe: 'explain-pricing',
      description: 'What is included and what it costs.',
      recommended: true,
    },
    {
      key: 'about',
      title: 'About',
      slug: '/about',
      recipe: 'build-trust',
      description: 'Who you are and how you work.',
      recommended: true,
    },
    {
      key: 'contact',
      title: 'Enquire',
      slug: '/enquire',
      recipe: 'generate-leads',
      description: 'Check a date and get a quote.',
      recommended: true,
    },
  ],
  forms: ['quote'],
  vocabulary: { offerings: 'Packages', primaryAction: 'Check your date' },
  content: {
    hero: {
      eyebrow: 'Weddings · Portraits · Brands',
      heading: 'Photographs that still feel like the day',
      description:
        'Unposed, unhurried and edited by hand. I shoot a limited number of weddings a year so every one gets my full attention.',
      primaryCta: 'Check your date',
      secondaryCta: 'See the portfolio',
    },
    about: {
      eyebrow: 'About',
      heading: 'I photograph how a day felt, not just how it looked',
      body: 'Twelve years, three hundred weddings, and I still get nervous before the first look. That is a good sign.\n\nMy approach is quiet: I find the light, I stay out of the way, and I wait for the moment rather than staging it. Couples tell me they forgot I was there. That is the review I want.',
    },
    features: [
      {
        icon: 'camera',
        title: 'Documentary first',
        description: 'Real moments, gently directed only when you want it.',
      },
      {
        icon: 'sparkles',
        title: 'Hand-edited',
        description: 'Every image finished by me, consistent from first to last.',
      },
      {
        icon: 'clock',
        title: 'Delivered in four weeks',
        description: 'A preview within 48 hours, the full gallery in a month.',
      },
    ],
    services: [
      {
        title: 'Weddings',
        description: 'Full-day coverage with a second photographer.',
        price: 'from 18M',
      },
      {
        title: 'Portraits and families',
        description: 'An hour on location, twenty finished images.',
        price: 'from 2.5M',
      },
      {
        title: 'Brands and products',
        description: 'Half or full days for businesses that need real imagery.',
        price: 'from 4M / half day',
      },
    ],
    process: [
      { title: 'Say hello', description: 'Tell me the date and the plan; I hold it for a week.' },
      { title: 'We meet', description: 'Coffee or a call to talk through the day.' },
      { title: 'The gallery', description: 'Preview in two days, everything in four weeks.' },
    ],
    stats: [
      { value: '300+', label: 'Weddings photographed' },
      { value: '12', label: 'Years' },
      { value: '48 h', label: 'To first preview' },
    ],
    testimonials: [
      {
        quote: 'We cried at the preview. Every photo looks like how we remember it.',
        name: 'Anisa & Dimas',
        role: 'Wedding, 2025',
        rating: 5,
      },
      {
        quote: 'Calm, invisible, and somehow everywhere at once.',
        name: 'Karin & Jo',
        role: 'Wedding',
        rating: 5,
      },
      {
        quote: 'Our product photos finally look like our brand.',
        name: 'Tania W.',
        role: 'Founder, Loka Ceramics',
        rating: 5,
      },
    ],
    faq: [
      {
        question: 'Do you travel?',
        answer: 'Anywhere in Indonesia; travel is included within Java and quoted beyond.',
      },
      {
        question: 'How many photos do we get?',
        answer: 'A full wedding day is typically 600 to 900 finished images.',
      },
      {
        question: 'Do you offer albums?',
        answer: 'Yes, hand-bound in linen or leather, designed with you after the gallery.',
      },
    ],
    cta: {
      eyebrow: 'Limited dates each year',
      heading: 'Check your date',
      description: 'Tell me when and where. I reply within two days, usually sooner.',
      label: 'Check your date',
    },
    team: [],
    hours: [],
    portfolio: [
      { title: 'Anisa & Dimas, Ubud', category: 'Wedding' },
      { title: 'The Hartono family', category: 'Portrait' },
      { title: 'Loka Ceramics', category: 'Brand' },
      { title: 'Karin & Jo, Bandung', category: 'Wedding' },
    ],
    pricing: [
      {
        name: 'Portrait session',
        price: 'Rp 2.5M',
        period: '',
        description: 'One hour, one location.',
        features: ['20 finished images', 'Online gallery', 'Print release'],
      },
      {
        name: 'Wedding',
        price: 'Rp 18M',
        period: '',
        description: 'Full day, two photographers.',
        features: [
          'Up to 12 hours',
          'Second photographer',
          '600–900 images',
          'Preview in 48 hours',
          'Online gallery for a year',
        ],
        highlighted: true,
        badge: 'Most booked',
      },
      {
        name: 'Brand day',
        price: 'Rp 7M',
        period: '',
        description: 'A full day for your business.',
        features: [
          'Up to 8 hours',
          'Products, team and space',
          'Commercial licence',
          'Delivered in two weeks',
        ],
      },
    ],
  },
};
