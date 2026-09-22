import type { BusinessPack } from '../types.ts';

export const clinic: BusinessPack = {
  id: 'clinic',
  name: 'Clinic',
  description: 'Services, doctors, hours and appointment requests for a medical or dental clinic.',
  icon: 'stethoscope',
  suggestedPreset: 'minimal',
  structuredDataType: 'LocalBusiness',
  homeSections: [
    'hero',
    'services',
    'feature-grid',
    'team',
    'business-hours',
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
      description: 'Services, doctors, hours, booking.',
      recommended: true,
    },
    {
      key: 'services',
      title: 'Services',
      slug: '/services',
      recipe: 'sell-service',
      description: 'Treatments and what to expect.',
      recommended: true,
    },
    {
      key: 'about',
      title: 'Our doctors',
      slug: '/doctors',
      recipe: 'build-trust',
      description: 'Profiles and qualifications.',
      recommended: true,
    },
    {
      key: 'contact',
      title: 'Book an appointment',
      slug: '/appointments',
      recipe: 'collect-bookings',
      description: 'Appointment request, hours and directions.',
      recommended: true,
    },
  ],
  forms: ['booking'],
  vocabulary: { offerings: 'Services', primaryAction: 'Book an appointment' },
  content: {
    hero: {
      eyebrow: 'Family and dental clinic',
      heading: 'Care that starts on time',
      description:
        'Same-week appointments, doctors who listen, and a front desk that calls you back. Walk-ins welcome every morning.',
      primaryCta: 'Book an appointment',
      secondaryCta: 'Our services',
    },
    about: {
      eyebrow: 'The clinic',
      heading: 'Small enough to know you, equipped like a hospital',
      body: 'We opened in 2014 with two consulting rooms. Today we have six, a dental suite, and an in-house lab that returns most results the same day.\n\nOur doctors stay with you: you see the same GP each visit unless you ask otherwise.',
    },
    features: [
      {
        icon: 'clock',
        title: 'On time, or we tell you',
        description: 'Average wait under ten minutes. Delays are texted before you leave home.',
      },
      {
        icon: 'shield',
        title: 'Insurance friendly',
        description: 'Direct billing with the major insurers; we handle the paperwork.',
      },
      {
        icon: 'heart',
        title: 'Children welcome',
        description: 'A paediatric GP, a play corner and a very good sticker drawer.',
      },
    ],
    services: [
      {
        title: 'General practice',
        description: 'Check-ups, illness, chronic care, referrals.',
        price: 'from 150k',
      },
      {
        title: 'Dental',
        description: 'Cleaning, fillings, crowns and whitening.',
        price: 'from 250k',
      },
      {
        title: 'Vaccinations',
        description: 'Childhood schedule, travel and flu shots.',
        price: 'from 120k',
      },
      {
        title: 'Lab tests',
        description: 'Blood work with most results the same day.',
        price: 'from 90k',
      },
    ],
    process: [
      { title: 'Request a slot', description: 'Online, by phone or WhatsApp.' },
      { title: 'We confirm', description: 'A text with the time, the doctor and what to bring.' },
      { title: 'Your visit', description: 'Seen on time, followed up by phone.' },
    ],
    stats: [
      { value: '<10 min', label: 'Average wait' },
      { value: '6', label: 'Doctors' },
      { value: '18k', label: 'Patients cared for' },
    ],
    testimonials: [
      {
        quote: 'The only clinic where my appointment has started at the time on the card.',
        name: 'Yuni A.',
        role: 'Patient',
        rating: 5,
      },
      {
        quote: 'Dr. Sari explained everything to my mother in Sundanese. That mattered.',
        name: 'Rizky F.',
        role: 'Patient’s son',
        rating: 5,
      },
      {
        quote: 'Dental work without the dread. Gentle and quick.',
        name: 'Marco D.',
        role: 'Patient',
        rating: 5,
      },
    ],
    faq: [
      {
        question: 'Do you accept insurance?',
        answer: 'Yes. We bill Allianz, AXA, Prudential and BPJS directly. Bring your card.',
      },
      {
        question: 'Can I walk in?',
        answer: 'Every weekday morning from 08:00 to 11:00. Afternoons are by appointment.',
      },
      {
        question: 'How do I get my results?',
        answer: 'Most lab results are ready the same day and sent securely to your phone.',
      },
    ],
    cta: {
      eyebrow: 'Same-week appointments',
      heading: 'Book your visit',
      description:
        'Tell us what you need and when suits you. We confirm within the hour during opening times.',
      label: 'Book an appointment',
    },
    team: [
      {
        name: 'dr. Sari Wulandari',
        role: 'General practitioner',
        bio: 'Family medicine, 15 years. Speaks Indonesian, Sundanese and English.',
      },
      {
        name: 'drg. Kevin Halim',
        role: 'Dentist',
        bio: 'Restorative and cosmetic dentistry, gentle by reputation.',
      },
      { name: 'dr. Amira Putri', role: 'Paediatrician', bio: 'Children from newborn to teenager.' },
    ],
    hours: [
      { day: 'Monday – Friday', open: '08:00', close: '20:00' },
      { day: 'Saturday', open: '08:00', close: '14:00' },
      { day: 'Sunday', open: '00:00', close: '00:00', closed: true },
    ],
  },
};
