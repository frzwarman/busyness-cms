import type { ImageRef } from '@siteos/schemas';

/** Neutral vector placeholders shipped with the renderer. Marked decorative until replaced with real photos. */
export const placeholderImages: ImageRef[] = [
  'placeholder-1',
  'placeholder-2',
  'placeholder-3',
  'placeholder-4',
].map((n) => ({
  src: `/demo/${n}.svg`,
  alt: '',
  decorative: true,
  width: 1600,
  height: 1200,
  focalX: 0.5,
  focalY: 0.5,
}));

export const cafeImages: ImageRef[] = [
  {
    src: '/demo/cafe-hero.svg',
    alt: 'Barista pouring a flat white at a wooden counter',
    decorative: false,
    width: 1600,
    height: 1200,
    focalX: 0.6,
    focalY: 0.4,
  },
  {
    src: '/demo/roastery.svg',
    alt: 'Green coffee beans in burlap sacks beside a small roaster',
    decorative: false,
    width: 1200,
    height: 900,
    focalX: 0.5,
    focalY: 0.5,
  },
  ...placeholderImages.slice(0, 2),
];
