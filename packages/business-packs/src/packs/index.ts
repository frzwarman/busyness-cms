import type { BusinessPack } from '../types.ts';
import { agency } from './agency.ts';
import { automotive } from './automotive.ts';
import { barbershop } from './barbershop.ts';
import { cafe } from './cafe.ts';
import { clinic } from './clinic.ts';
import { construction } from './construction.ts';
import { freelancer } from './freelancer.ts';
import { generic } from './generic.ts';
import { gym } from './gym.ts';
import { hotel } from './hotel.ts';
import { lawFirm } from './law-firm.ts';
import { photographer } from './photographer.ts';
import { realEstate } from './real-estate.ts';
import { restaurant } from './restaurant.ts';
import { saas } from './saas.ts';
import { wedding } from './wedding.ts';

/** Suggestions, not restrictions: everything a pack generates is ordinary editable content. */
export const businessPacks: BusinessPack[] = [
  restaurant,
  cafe,
  agency,
  saas,
  lawFirm,
  clinic,
  barbershop,
  gym,
  hotel,
  realEstate,
  photographer,
  freelancer,
  construction,
  automotive,
  wedding,
  generic,
];

export const packById = (id: string): BusinessPack | undefined =>
  businessPacks.find((p) => p.id === id);
export const packOrGeneric = (id: string | undefined | null): BusinessPack =>
  packById(id ?? '') ?? generic;
