import type { BusinessPack } from '../types.ts';

export const hotel: BusinessPack = {
  id: 'hotel',
  name: 'Hotel & guesthouse',
  description: 'Rooms, rates, amenities and a booking enquiry.',
  icon: 'bed',
  suggestedPreset: 'luxury',
  structuredDataType: 'Hotel',
  homeSections: [
    'hero',
    'image-text',
    'services',
    'feature-grid',
    'gallery',
    'testimonials',
    'locations',
    'cta',
  ],
  suggestedPages: [
    {
      key: 'home',
      title: 'Home',
      slug: '/',
      recipe: 'home',
      description: 'Rooms, amenities, location, booking.',
      recommended: true,
    },
    {
      key: 'services',
      title: 'Rooms',
      slug: '/rooms',
      recipe: 'sell-service',
      description: 'Each room type with rates.',
      recommended: true,
    },
    {
      key: 'gallery',
      title: 'Gallery',
      slug: '/gallery',
      recipe: 'gallery',
      description: 'Rooms, grounds, breakfast.',
      recommended: true,
    },
    {
      key: 'about',
      title: 'About',
      slug: '/about',
      recipe: 'build-trust',
      description: 'The house, the hosts, the area.',
      recommended: false,
    },
    {
      key: 'contact',
      title: 'Book',
      slug: '/book',
      recipe: 'collect-bookings',
      description: 'Booking enquiry, directions.',
      recommended: true,
    },
  ],
  forms: ['booking'],
  vocabulary: { offerings: 'Rooms', primaryAction: 'Check availability' },
  content: {
    hero: {
      eyebrow: 'Twelve rooms · Hillside · Breakfast included',
      heading: 'Wake up to mist on the tea gardens',
      description:
        'A quiet house above the valley with twelve rooms, a long breakfast table and a host who knows the best warung within walking distance.',
      primaryCta: 'Check availability',
      secondaryCta: 'See the rooms',
    },
    about: {
      eyebrow: 'The house',
      heading: 'A family home before it was a guesthouse',
      body: 'The house was built in 1962 by a tea planter and stayed in the family. We opened the doors to guests in 2016, kept the teak floors and added good mattresses.\n\nBreakfast is cooked to order and served until eleven. Nobody is asked to hurry.',
    },
    features: [
      {
        icon: 'coffee',
        title: 'Breakfast till eleven',
        description: 'Cooked to order, local fruit, proper coffee.',
      },
      {
        icon: 'leaf',
        title: 'Gardens and trails',
        description: 'Two hectares of garden and a path down to the river.',
      },
      {
        icon: 'car',
        title: 'Pickup from the station',
        description: 'We collect you from the train for free.',
      },
    ],
    services: [
      {
        title: 'Garden room',
        description: 'Queen bed, garden terrace, rain shower.',
        price: 'from 950k / night',
      },
      {
        title: 'Valley view',
        description: 'King bed, private balcony over the tea gardens.',
        price: 'from 1.4M / night',
      },
      {
        title: 'Family suite',
        description: 'Two bedrooms, sitting room, sleeps five.',
        price: 'from 2.2M / night',
      },
    ],
    process: [
      { title: 'Enquire', description: 'Tell us your dates and room. We reply within hours.' },
      { title: 'Confirm', description: 'A small deposit holds the room; the rest on arrival.' },
      { title: 'Arrive', description: 'We collect you from the station and put the kettle on.' },
    ],
    stats: [
      { value: '12', label: 'Rooms' },
      { value: '9.4', label: 'Guest score', description: '700+ stays' },
      { value: '1962', label: 'House built' },
    ],
    testimonials: [
      {
        quote:
          'The quietest three nights we have had in years. Breakfast on the terrace with the mist rolling in.',
        name: 'Claire & Tom',
        role: 'Guests from Melbourne',
        rating: 5,
      },
      {
        quote: 'Our kids ran the gardens all day and slept like logs. We barely left.',
        name: 'Familie Hartono',
        role: 'Family suite',
        rating: 5,
      },
      {
        quote: 'Hosts who genuinely care. They booked our hike and packed us lunch.',
        name: 'Yuki S.',
        role: 'Solo traveller',
        rating: 5,
      },
    ],
    faq: [
      {
        question: 'Is breakfast included?',
        answer: 'Yes, every room includes breakfast, cooked to order until eleven.',
      },
      {
        question: 'How do we get there?',
        answer:
          'Two hours by train from the city, then a fifteen-minute drive. We collect you from the station.',
      },
      {
        question: 'Do you have wifi?',
        answer:
          'In every room and on the terrace. Fast enough to work, slow enough to encourage you not to.',
      },
      {
        question: 'Are children welcome?',
        answer: 'Very. The family suite sleeps five, and the gardens are theirs.',
      },
    ],
    cta: {
      eyebrow: 'Book direct for the best rate',
      heading: 'Check availability',
      description: 'Tell us your dates. We reply personally, usually within the hour.',
      label: 'Check availability',
    },
    team: [
      {
        name: 'Ratna & Yusuf',
        role: 'Hosts',
        bio: 'Third generation in the house. Yusuf drives, Ratna cooks, both know the trails.',
      },
    ],
    hours: [],
  },
};
