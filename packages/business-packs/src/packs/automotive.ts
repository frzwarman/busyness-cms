import type { BusinessPack } from '../types.ts';

export const automotive: BusinessPack = {
  id: 'automotive',
  name: 'Automotive',
  description: 'Services, prices, hours and a booking form for a garage or detailer.',
  icon: 'car',
  suggestedPreset: 'corporate',
  structuredDataType: 'LocalBusiness',
  homeSections: [
    'hero',
    'services',
    'feature-grid',
    'process',
    'testimonials',
    'business-hours',
    'locations',
    'cta',
  ],
  suggestedPages: [
    {
      key: 'home',
      title: 'Home',
      slug: '/',
      recipe: 'home',
      description: 'Services, prices, hours, booking.',
      recommended: true,
    },
    {
      key: 'services',
      title: 'Services',
      slug: '/services',
      recipe: 'sell-service',
      description: 'Everything you do, with prices.',
      recommended: true,
    },
    {
      key: 'about',
      title: 'About',
      slug: '/about',
      recipe: 'build-trust',
      description: 'The workshop and the mechanics.',
      recommended: false,
    },
    {
      key: 'contact',
      title: 'Book a service',
      slug: '/book',
      recipe: 'collect-bookings',
      description: 'Booking form, hours, directions.',
      recommended: true,
    },
  ],
  forms: ['booking'],
  vocabulary: { offerings: 'Services', primaryAction: 'Book a service' },
  content: {
    hero: {
      eyebrow: 'Servicing · Repairs · Tyres',
      heading: 'The garage that calls before it charges',
      description:
        'Diagnosis first, a phone call with the price second, and no work you did not approve. Courtesy drop-off within five kilometres.',
      primaryCta: 'Book a service',
      secondaryCta: 'See services',
    },
    about: {
      eyebrow: 'The workshop',
      heading: 'Four bays, factory tools, no upselling',
      body: 'We started as a two-bay shop fixing what the dealers quoted too much for. Twelve years later the tools are dealer-grade and the prices still are not.\n\nEvery job gets photos of what we found and a call before anything is replaced.',
    },
    features: [
      {
        icon: 'phone',
        title: 'Approve before we fix',
        description: 'We call with photos and a price. Nothing happens without a yes.',
      },
      {
        icon: 'shield',
        title: 'Twelve-month guarantee',
        description: 'Parts and labour on every repair.',
      },
      {
        icon: 'car',
        title: 'Free local drop-off',
        description: 'We bring the car back within five kilometres.',
      },
    ],
    services: [
      {
        title: 'Regular service',
        description: 'Oil, filters, fluids, 40-point inspection with photo report.',
        price: 'from 650k',
      },
      { title: 'Brakes', description: 'Pads, discs and fluid, all makes.', price: 'from 900k' },
      {
        title: 'Tyres and alignment',
        description: 'Fitting, balancing and four-wheel alignment.',
        price: 'from 250k / tyre',
      },
      {
        title: 'Air conditioning',
        description: 'Leak test, recharge and compressor repair.',
        price: 'from 450k',
      },
      {
        title: 'Diagnostics',
        description: 'Dealer-level scan tools for warning lights and faults.',
        price: '250k, waived if repaired',
      },
    ],
    process: [
      { title: 'Book', description: 'Pick a day online; drop off from seven.' },
      { title: 'Inspect and call', description: 'Photos and a price before any work starts.' },
      {
        title: 'Collect or delivery',
        description: 'Same day for most jobs, delivered within five kilometres.',
      },
    ],
    stats: [
      { value: '12', label: 'Years open' },
      { value: '4.8', label: 'Google rating', description: '900+ reviews' },
      { value: '12 mo', label: 'Guarantee' },
    ],
    testimonials: [
      {
        quote: 'Sent me photos of the worn pads before quoting. First garage I fully trust.',
        name: 'Hendra S.',
        role: 'Google review',
        rating: 5,
      },
      {
        quote: 'Half the dealer quote, same parts, done by four.',
        name: 'Maya T.',
        role: 'Regular customer',
        rating: 5,
      },
      {
        quote: 'They dropped the car at my office. Who does that?',
        name: 'Iwan P.',
        role: 'Customer',
        rating: 5,
      },
    ],
    faq: [
      {
        question: 'Do you service cars under warranty?',
        answer:
          'Yes. We use manufacturer-approved parts and stamp the book; your warranty stays valid.',
      },
      {
        question: 'Can I wait?',
        answer:
          'There is a waiting room with wifi and coffee. Most services take two to three hours.',
      },
      {
        question: 'Do you work on all makes?',
        answer: 'Japanese, Korean and European cars daily. Ask about anything unusual.',
      },
    ],
    cta: {
      eyebrow: 'Open Monday – Saturday',
      heading: 'Book your service',
      description: 'Choose a day; we confirm by WhatsApp within the hour.',
      label: 'Book a service',
    },
    team: [
      {
        name: 'Pak Budi',
        role: 'Owner · Master technician',
        bio: 'Twenty-five years, including eight at a main dealer.',
      },
      { name: 'Eko', role: 'Technician', bio: 'Electrical faults and diagnostics.' },
    ],
    hours: [
      { day: 'Monday – Friday', open: '07:00', close: '18:00' },
      { day: 'Saturday', open: '08:00', close: '15:00' },
      { day: 'Sunday', open: '00:00', close: '00:00', closed: true },
    ],
  },
};
