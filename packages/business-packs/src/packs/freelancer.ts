import type { BusinessPack } from '../types.ts';

export const freelancer: BusinessPack = {
  id: 'freelancer',
  name: 'Freelancer / consultant',
  description: 'What you do, proof you can do it, and a way to hire you.',
  icon: 'briefcase',
  suggestedPreset: 'minimal',
  structuredDataType: 'ProfessionalService',
  homeSections: ['hero', 'services', 'portfolio', 'process', 'testimonials', 'faq', 'cta'],
  suggestedPages: [
    {
      key: 'home',
      title: 'Home',
      slug: '/',
      recipe: 'home',
      description: 'Services, work, process, proof.',
      recommended: true,
    },
    {
      key: 'work',
      title: 'Work',
      slug: '/work',
      recipe: 'show-portfolio',
      description: 'Selected projects.',
      recommended: true,
    },
    {
      key: 'about',
      title: 'About',
      slug: '/about',
      recipe: 'build-trust',
      description: 'Background and how you work.',
      recommended: true,
    },
    {
      key: 'contact',
      title: 'Hire me',
      slug: '/hire',
      recipe: 'generate-leads',
      description: 'Project enquiry form.',
      recommended: true,
    },
  ],
  forms: ['quote'],
  vocabulary: { offerings: 'Services', primaryAction: 'Start a conversation' },
  content: {
    hero: {
      eyebrow: 'Independent product designer',
      heading: 'I help small teams ship products people can actually use',
      description:
        'Research, UX and interface design for startups and internal tools. One person, senior, hands-on, from first sketch to shipped screens.',
      primaryCta: 'Start a conversation',
      secondaryCta: 'See my work',
    },
    about: {
      eyebrow: 'About',
      heading: 'Ten years in-house, now working with several teams at once',
      body: 'I led design at two startups before going independent in 2021. The pattern was always the same: small teams, hard problems, not enough hands.\n\nNow I take on two or three clients at a time and work embedded, like a colleague who happens to invoice.',
    },
    features: [
      {
        icon: 'zap',
        title: 'Fast to start',
        description: 'Kickoff within a week, first designs the week after.',
      },
      {
        icon: 'users',
        title: 'Works inside your team',
        description: 'Your Slack, your standups, your tools.',
      },
      {
        icon: 'check',
        title: 'Ships, not decks',
        description: 'Deliverables are working screens and specs your engineers use.',
      },
    ],
    services: [
      {
        title: 'Product design sprint',
        description: 'Two weeks from problem to tested prototype.',
        price: '35M',
      },
      {
        title: 'Embedded design',
        description: 'Part-time member of your team, month to month.',
        price: 'from 25M / month',
      },
      {
        title: 'UX audit',
        description: 'Where users get stuck and what to fix first.',
        price: '9M',
      },
    ],
    process: [
      { title: 'Intro call', description: 'Thirty minutes to see if we fit. No pitch.' },
      {
        title: 'Scope and price',
        description: 'A one-page proposal with a fixed price or monthly rate.',
      },
      { title: 'Work in the open', description: 'Weekly demos, shared files, no big reveals.' },
    ],
    stats: [
      { value: '40+', label: 'Products shipped' },
      { value: '10', label: 'Years in product' },
      { value: '3', label: 'Clients at a time, max' },
    ],
    testimonials: [
      {
        quote: 'Felt like hiring a senior designer without the six-month search.',
        name: 'Ravi M.',
        role: 'CTO, logistics startup',
        rating: 5,
      },
      {
        quote: 'Our onboarding completion went from 41% to 73% after the sprint.',
        name: 'Lita S.',
        role: 'Head of product',
        rating: 5,
      },
      { quote: 'Direct, kind, and very fast.', name: 'Jonas K.', role: 'Founder', rating: 5 },
    ],
    faq: [
      {
        question: 'Do you work hourly?',
        answer: 'Rarely. Fixed-price sprints and monthly embedded rates keep incentives aligned.',
      },
      {
        question: 'Can you start soon?',
        answer: 'Usually within two weeks. Ask; the calendar changes.',
      },
      {
        question: 'Do you build as well?',
        answer:
          'I prototype in code and hand engineers specs they can build from, but I am not your front-end team.',
      },
    ],
    cta: {
      eyebrow: 'Taking new projects',
      heading: 'Let’s talk about your product',
      description:
        'A short intro call. If I am not the right fit, I will say so and suggest who is.',
      label: 'Start a conversation',
    },
    team: [],
    hours: [],
    portfolio: [
      { title: 'Dispatch app for a logistics startup', category: 'Product design' },
      { title: 'Onboarding redesign, fintech', category: 'UX' },
      { title: 'Internal tooling for a clinic group', category: 'Design system' },
    ],
  },
};
