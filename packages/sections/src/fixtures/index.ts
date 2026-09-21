import type { PageDocument, PageSummary, ThemeTokens } from '@siteos/schemas';

/** Demo site: "Kopi Sudut", a specialty coffee bar. Coherent placeholder content, no lorem ipsum. */
export const demoTheme: ThemeTokens = {
  colors: {
    primary: '#7c2d12',
    secondary: '#292524',
    accent: '#b45309',
    background: '#fdfaf5',
    surface: '#f3ede3',
    text: '#1c1917',
    muted: '#78716c',
  },
  typography: {
    headingFont: 'system-serif',
    bodyFont: 'humanist',
    baseSize: 'md',
    headingScale: 'dramatic',
    headingWeight: 'medium',
  },
  shape: { radius: 'none', buttonStyle: 'outline' },
  layout: { contentWidth: 'narrow', sectionSpacing: 'airy', cardSpacing: 'standard' },
};

export const demoPages: PageSummary[] = [
  { id: 'page_home', slug: '/', title: 'Home' },
  { id: 'page_about', slug: '/about', title: 'About' },
];

export const demoHomePage: PageDocument = {
  id: 'page_home',
  slug: '/',
  title: 'Home',
  seo: {
    title: 'Kopi Sudut — Specialty coffee in Bogor',
    description: 'Single-origin coffee, fresh pastries and slow mornings in the heart of Bogor.',
    noindex: false,
  },
  sections: [
    {
      id: 'sec_demo00000001',
      type: 'hero',
      schemaVersion: 1,
      hidden: false,
      props: {
        variant: 'split',
        eyebrow: 'Bogor · Since 2019',
        heading: 'Coffee worth slowing down for',
        description:
          'Single-origin beans roasted in small batches, pastries baked before sunrise, and a corner table with your name on it.',
        alignment: 'left',
        height: 'standard',
        mediaPosition: 'right',
        media: {
          src: '/demo/cafe-hero.svg',
          alt: 'Barista pouring a flat white at a wooden counter',
          decorative: false,
          width: 1600,
          height: 1200,
          focalX: 0.6,
          focalY: 0.4,
        },
        primaryCta: {
          label: 'See the menu',
          link: { kind: 'anchor', anchor: 'menu' },
          style: 'filled',
        },
        secondaryCta: {
          label: 'Find us',
          link: { kind: 'page', pageId: 'page_about' },
          style: 'outline',
        },
        theme: 'light',
        spacing: 'standard',
      },
    },
    {
      id: 'sec_demo00000002',
      type: 'image-text',
      schemaVersion: 1,
      hidden: false,
      props: {
        variant: 'image-left',
        eyebrow: 'Our story',
        heading: 'Roasted here, poured here',
        body: 'We started as a two-seat window bar on Jalan Pajajaran and grew into the neighbourhood living room.\n\nEvery bean we serve comes from farms we have visited in Gayo, Toraja and Kintamani. We roast weekly, so nothing on the shelf is older than ten days.',
        image: {
          src: '/demo/roastery.svg',
          alt: 'Green coffee beans in burlap sacks beside a small roaster',
          decorative: false,
          width: 1200,
          height: 900,
          focalX: 0.5,
          focalY: 0.5,
        },
        imageRatio: 'landscape',
        cta: {
          label: 'Read our story',
          link: { kind: 'page', pageId: 'page_about' },
          style: 'text',
        },
        theme: 'surface',
        spacing: 'standard',
      },
    },
    {
      id: 'sec_demo00000003',
      type: 'cta',
      schemaVersion: 1,
      hidden: false,
      props: {
        variant: 'banner',
        eyebrow: 'Open daily 07:00 – 21:00',
        heading: 'Book the corner table',
        description: 'Groups of six or more can reserve ahead. Walk-ins are always welcome.',
        primaryCta: {
          label: 'Reserve a table',
          link: { kind: 'phone', phone: '+62 251 555 0100' },
          style: 'filled',
        },
        secondaryCta: {
          label: 'Email us',
          link: { kind: 'email', email: 'hello@kopisudut.example' },
          style: 'outline',
        },
        theme: 'brand',
        spacing: 'large',
      },
    },
  ],
};

export const demoAboutPage: PageDocument = {
  id: 'page_about',
  slug: '/about',
  title: 'About',
  seo: { noindex: false },
  sections: [
    {
      id: 'sec_demo00000010',
      type: 'hero',
      schemaVersion: 1,
      hidden: false,
      props: {
        variant: 'centered',
        eyebrow: 'About Kopi Sudut',
        heading: 'A small roastery with big opinions about coffee',
        description: 'Three friends, one roaster, and a promise to never serve a stale bean.',
        alignment: 'center',
        height: 'compact',
        mediaPosition: 'right',
        media: null,
        primaryCta: null,
        secondaryCta: null,
        theme: 'surface',
        spacing: 'standard',
      },
    },
  ],
};
