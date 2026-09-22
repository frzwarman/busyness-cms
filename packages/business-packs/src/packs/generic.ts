import type { BusinessPack } from '../types.ts';

export const generic: BusinessPack = {
  id: 'generic',
  name: 'Other business',
  description:
    'A solid starting point for any small business: what you do, why you, how to reach you.',
  icon: 'briefcase',
  suggestedPreset: 'minimal',
  structuredDataType: 'LocalBusiness',
  homeSections: ['hero', 'feature-grid', 'services', 'testimonials', 'faq', 'cta'],
  suggestedPages: [
    {
      key: 'home',
      title: 'Home',
      slug: '/',
      recipe: 'home',
      description: 'What you do, why you, proof, contact.',
      recommended: true,
    },
    {
      key: 'services',
      title: 'Services',
      slug: '/services',
      recipe: 'sell-service',
      description: 'Your offerings in detail.',
      recommended: true,
    },
    {
      key: 'about',
      title: 'About',
      slug: '/about',
      recipe: 'build-trust',
      description: 'Your story and team.',
      recommended: true,
    },
    {
      key: 'contact',
      title: 'Contact',
      slug: '/contact',
      recipe: 'contact',
      description: 'Form, details, hours.',
      recommended: true,
    },
  ],
  forms: [],
  vocabulary: { offerings: 'Services', primaryAction: 'Get in touch' },
  content: {
    hero: {
      eyebrow: 'Local, independent, reliable',
      heading: 'Good work, done properly, by people you can call',
      description:
        'Replace this with one sentence about who you help and how. Keep it plain: what you do, for whom, and what makes you the right choice.',
      primaryCta: 'Get in touch',
      secondaryCta: 'What we do',
    },
    about: {
      eyebrow: 'About us',
      heading: 'Why we started and what we stand for',
      body: 'Tell your story in two short paragraphs. How the business began, what you care about, and what a customer can expect.\n\nSpecifics beat adjectives: years in business, the neighbourhood you serve, the standard you hold yourself to.',
    },
    features: [
      {
        icon: 'check',
        title: 'Reliable',
        description: 'We show up when we say we will and finish what we start.',
      },
      {
        icon: 'heart',
        title: 'Personal',
        description: 'You deal with the owner, not a call centre.',
      },
      { icon: 'shield', title: 'Guaranteed', description: 'If it is not right, we make it right.' },
    ],
    services: [
      {
        title: 'First service',
        description: 'Describe what it is, who it is for and what is included.',
        price: 'from 500k',
      },
      {
        title: 'Second service',
        description: 'One or two sentences is plenty.',
        price: 'from 1.2M',
      },
      {
        title: 'Third service',
        description: 'Prices help people decide; ranges are fine.',
        price: 'Ask for a quote',
      },
    ],
    process: [
      { title: 'Get in touch', description: 'Call, message or fill in the form.' },
      { title: 'We agree the plan', description: 'A clear price and timeline before we start.' },
      { title: 'We deliver', description: 'On time, as agreed, with a follow-up call.' },
    ],
    stats: [
      { value: '10+', label: 'Years in business' },
      { value: '500+', label: 'Happy customers' },
      { value: '4.9', label: 'Average rating' },
    ],
    testimonials: [
      {
        quote: 'Exactly what they promised, exactly when they promised it.',
        name: 'A happy customer',
        role: 'Replace with a real review',
        rating: 5,
      },
      {
        quote: 'Friendly, fair and fast. Recommended to all my neighbours.',
        name: 'Another customer',
        role: 'Replace with a real review',
        rating: 5,
      },
      {
        quote: 'The kind of business you hope still exists. It does.',
        name: 'A regular',
        role: 'Replace with a real review',
        rating: 5,
      },
    ],
    faq: [
      { question: 'What areas do you serve?', answer: 'List your neighbourhoods or cities here.' },
      {
        question: 'How do I get a quote?',
        answer: 'Send a message with what you need and we reply within one business day.',
      },
      {
        question: 'What are your hours?',
        answer: 'Update the opening hours section and this answer to match.',
      },
    ],
    cta: {
      eyebrow: 'We reply within one business day',
      heading: 'Ready to get started?',
      description: 'Tell us what you need and we will come back with a clear plan and price.',
      label: 'Get in touch',
    },
    team: [
      { name: 'Your name', role: 'Owner', bio: 'A sentence about you and why you do this work.' },
    ],
    hours: [
      { day: 'Monday – Friday', open: '09:00', close: '17:00' },
      { day: 'Saturday', open: '09:00', close: '13:00' },
      { day: 'Sunday', open: '00:00', close: '00:00', closed: true },
    ],
  },
};
