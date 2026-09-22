import type { BusinessPack } from '../types.ts';

export const restaurant: BusinessPack = {
  id: 'restaurant',
  name: 'Restaurant',
  description: 'Menu, hours, reservations and reviews for a sit-down restaurant.',
  icon: 'utensils',
  suggestedPreset: 'editorial',
  structuredDataType: 'Restaurant',
  homeSections: [
    'hero',
    'menu',
    'image-text',
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
      description: 'Signature dishes, hours, reviews and a reservation button.',
      recommended: true,
    },
    {
      key: 'menu',
      title: 'Menu',
      slug: '/menu',
      recipe: 'show-menu',
      description: 'Full menu by course with prices.',
      recommended: true,
    },
    {
      key: 'about',
      title: 'About',
      slug: '/about',
      recipe: 'build-trust',
      description: 'The story, the kitchen team, the numbers.',
      recommended: true,
    },
    {
      key: 'gallery',
      title: 'Gallery',
      slug: '/gallery',
      recipe: 'gallery',
      description: 'The room, the plates, the people.',
      recommended: false,
    },
    {
      key: 'contact',
      title: 'Reservations',
      slug: '/reservations',
      recipe: 'collect-bookings',
      description: 'Booking form, hours and directions.',
      recommended: true,
    },
  ],
  forms: ['booking'],
  vocabulary: { offerings: 'Menu', primaryAction: 'Reserve a table' },
  content: {
    hero: {
      eyebrow: 'Dinner from 17:30 · Lunch weekends',
      heading: 'Slow-cooked, shared, remembered',
      description:
        'A neighbourhood kitchen where the stock simmers all day, the bread is baked at four, and nobody is rushed out for the next table.',
      primaryCta: 'Reserve a table',
      secondaryCta: 'See the menu',
    },
    about: {
      eyebrow: 'Our kitchen',
      heading: 'Cooking the way our grandmothers did, plated the way we like it',
      body: 'We opened with six tables and one wood-fired oven. The oven is still here.\n\nEverything is made in-house: the sambal, the rendang that takes two days, the coconut ice cream. We buy from three farms we can drive to before breakfast.',
    },
    features: [
      {
        icon: 'leaf',
        title: 'Market-led menu',
        description: 'The board changes weekly with what the farms bring in.',
      },
      {
        icon: 'utensils',
        title: 'Made from scratch',
        description: 'Stocks, pastes, breads and desserts, all ours.',
      },
      {
        icon: 'users',
        title: 'Built for sharing',
        description: 'Family-style plates that land in the middle of the table.',
      },
    ],
    services: [
      {
        title: 'Dinner',
        description: 'Full menu, wine list and specials every evening.',
        price: 'from 85k',
      },
      {
        title: 'Weekend lunch',
        description: 'A shorter, brighter menu from noon to three.',
        price: 'from 65k',
      },
      {
        title: 'Private dining',
        description: 'The back room seats sixteen for celebrations.',
        price: 'from 350k pp',
      },
    ],
    process: [
      { title: 'Book a table', description: 'Online, by phone, or walk in before seven.' },
      {
        title: 'Order for the table',
        description: 'We suggest four plates for two, six for four.',
      },
      { title: 'Stay a while', description: 'Dessert and kopi are never rushed here.' },
    ],
    stats: [
      { value: '12', label: 'Years open' },
      { value: '4.8', label: 'Google rating', description: '1,200+ reviews' },
      { value: '3', label: 'Partner farms' },
    ],
    testimonials: [
      {
        quote: 'The rendang alone is worth the drive from Jakarta. We come back every month.',
        name: 'Rina S.',
        role: 'Google review',
        rating: 5,
      },
      {
        quote: 'They handled our anniversary dinner for twelve without a single hiccup.',
        name: 'Bayu & Sari',
        role: 'Private dining',
        rating: 5,
      },
      {
        quote: 'Honest food, fair prices, staff who remember your order.',
        name: 'Daniel K.',
        role: 'Regular',
        rating: 5,
      },
    ],
    faq: [
      {
        question: 'Do you take reservations?',
        answer: 'Yes, for any party size at dinner. Weekend lunch is walk-in only.',
      },
      {
        question: 'Can you cater for allergies and vegetarians?',
        answer:
          'Tell us when you book. Half the menu is vegetarian, and most dishes can be made without nuts or shellfish.',
      },
      {
        question: 'Is there parking?',
        answer: 'Street parking outside and a paid lot two doors down.',
      },
      {
        question: 'Do you do events?',
        answer: 'The back room seats sixteen and can be booked for celebrations with a set menu.',
      },
    ],
    cta: {
      eyebrow: 'Tonight or this weekend',
      heading: 'Book a table',
      description: 'Reserve online in a minute. Walk-ins are welcome before seven.',
      label: 'Reserve a table',
    },
    team: [
      {
        name: 'Ibu Wati',
        role: 'Head chef',
        bio: 'Thirty years at the stove, two of them on television, all of them here.',
      },
      {
        name: 'Reza Pratama',
        role: 'Sous chef',
        bio: 'Runs the wood oven and the weekend specials.',
      },
      {
        name: 'Maya Lestari',
        role: 'Front of house',
        bio: 'Knows every regular by name and every wine on the list.',
      },
    ],
    hours: [
      { day: 'Tuesday – Friday', open: '17:30', close: '22:30' },
      { day: 'Saturday – Sunday', open: '12:00', close: '22:30' },
      { day: 'Monday', open: '00:00', close: '00:00', closed: true },
    ],
    menu: [
      {
        title: 'To share',
        items: [
          {
            name: 'Sate lilit',
            description: 'Minced fish, lemongrass skewers, sambal matah',
            price: '58k',
          },
          {
            name: 'Perkedel jagung',
            description: 'Sweetcorn fritters, chilli jam',
            price: '42k',
            tags: 'V',
          },
          {
            name: 'Gado-gado',
            description: 'Market vegetables, peanut sauce, emping',
            price: '55k',
            tags: 'V GF',
          },
        ],
      },
      {
        title: 'Mains',
        items: [
          {
            name: 'Rendang',
            description: 'Two-day beef, coconut, galangal',
            price: '125k',
            tags: 'GF',
          },
          {
            name: 'Ikan bakar',
            description: 'Whole grilled snapper, kecap, lime',
            price: '145k',
            tags: 'GF',
          },
          {
            name: 'Tempe mendoan',
            description: 'Young tempeh, turmeric batter, sambal kecap',
            price: '78k',
            tags: 'V',
          },
        ],
      },
      {
        title: 'Sweet',
        items: [
          {
            name: 'Es teler',
            description: 'Avocado, jackfruit, young coconut',
            price: '45k',
            tags: 'V GF',
          },
          {
            name: 'Klepon',
            description: 'Pandan rice balls, palm sugar, coconut',
            price: '38k',
            tags: 'V GF',
          },
        ],
      },
    ],
  },
};
