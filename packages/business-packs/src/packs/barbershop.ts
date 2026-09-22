import type { BusinessPack } from '../types.ts';

export const barbershop: BusinessPack = {
  id: 'barbershop',
  name: 'Barbershop',
  description: 'Cuts, prices, the barbers and online booking.',
  icon: 'scissors',
  suggestedPreset: 'luxury',
  structuredDataType: 'LocalBusiness',
  homeSections: [
    'hero',
    'services',
    'gallery',
    'team',
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
      description: 'Services, barbers, hours, booking.',
      recommended: true,
    },
    {
      key: 'services',
      title: 'Services & prices',
      slug: '/services',
      recipe: 'sell-service',
      description: 'Every cut and price.',
      recommended: true,
    },
    {
      key: 'gallery',
      title: 'Gallery',
      slug: '/gallery',
      recipe: 'gallery',
      description: 'The shop and the work.',
      recommended: true,
    },
    {
      key: 'contact',
      title: 'Book',
      slug: '/book',
      recipe: 'collect-bookings',
      description: 'Booking form, hours and directions.',
      recommended: true,
    },
  ],
  forms: ['booking'],
  vocabulary: { offerings: 'Services', primaryAction: 'Book a chair' },
  content: {
    hero: {
      eyebrow: 'Walk-ins welcome · Bookings preferred',
      heading: 'A proper cut, a hot towel, and a chair with your name on it',
      description:
        'Classic barbering with sharp modern fades. Open late on weekdays so you can come after work.',
      primaryCta: 'Book a chair',
      secondaryCta: 'Services & prices',
    },
    about: {
      eyebrow: 'The shop',
      heading: 'Three chairs, no rush',
      body: 'We opened because we were tired of ten-minute cuts. Every appointment is thirty minutes minimum, with a hot towel finish.\n\nThe kopi is free, the playlist is ours, and the barbers have been here since day one.',
    },
    features: [
      {
        icon: 'scissors',
        title: 'Thirty minutes, minimum',
        description: 'Time to talk through the cut and get it right.',
      },
      {
        icon: 'clock',
        title: 'Open till nine',
        description: 'Weekday evenings for people with jobs.',
      },
      {
        icon: 'star',
        title: 'Same barber every time',
        description: 'Book your barber, not just a slot.',
      },
    ],
    services: [
      { title: 'Classic cut', description: 'Consultation, cut, hot towel, style.', price: '85k' },
      { title: 'Skin fade', description: 'Precision fade with razor finish.', price: '110k' },
      {
        title: 'Beard trim & shape',
        description: 'Trim, line-up, hot towel and oil.',
        price: '60k',
      },
      { title: 'Cut & beard', description: 'The full service.', price: '150k' },
      { title: 'Kids under 12', description: 'Patient barbers, quick hands.', price: '65k' },
    ],
    process: [
      { title: 'Book your barber', description: 'Pick the person and the time online.' },
      { title: 'Talk it through', description: 'Photos welcome. We say what will and won’t work.' },
      { title: 'Hot towel finish', description: 'Every cut, every time.' },
    ],
    stats: [
      { value: '30 min', label: 'Minimum per cut' },
      { value: '4.9', label: 'Google rating', description: '600+ reviews' },
      { value: '3', label: 'Barbers' },
    ],
    testimonials: [
      {
        quote: 'First barber who listened and then did exactly that.',
        name: 'Ardi K.',
        role: 'Google review',
        rating: 5,
      },
      {
        quote: 'The fade is clean for three weeks, not three days.',
        name: 'Yoga P.',
        role: 'Regular',
        rating: 5,
      },
      {
        quote: 'Took my son for his first cut. No tears, great result.',
        name: 'Rina M.',
        role: 'Parent',
        rating: 5,
      },
    ],
    faq: [
      {
        question: 'Do I need to book?',
        answer:
          'Walk-ins are welcome, but evenings and Saturdays fill up. Booking guarantees your barber.',
      },
      {
        question: 'Do you cut long hair?',
        answer: 'Yes. Book a Classic cut and mention it in the notes so we allow extra time.',
      },
      {
        question: 'Is there parking?',
        answer: 'Two spots out front and street parking along the road.',
      },
    ],
    cta: {
      eyebrow: 'Open Tuesday – Sunday',
      heading: 'Book your chair',
      description: 'Pick your barber and time. We text a reminder the day before.',
      label: 'Book a chair',
    },
    team: [
      {
        name: 'Bang Doni',
        role: 'Owner · Barber',
        bio: 'Fifteen years, three cities, one shop he calls home.',
      },
      { name: 'Ilham', role: 'Barber', bio: 'Fades and razor work. Competition finalist 2025.' },
      { name: 'Teguh', role: 'Barber', bio: 'Classic cuts and beards. The kids’ favourite.' },
    ],
    hours: [
      { day: 'Tuesday – Friday', open: '11:00', close: '21:00' },
      { day: 'Saturday – Sunday', open: '09:00', close: '19:00' },
      { day: 'Monday', open: '00:00', close: '00:00', closed: true },
    ],
  },
};
