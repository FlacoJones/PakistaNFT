import { SPVariant, SPVariantInfo } from '@/types'

export const SP_VARIANT_INFO: { [variant in SPVariant]: SPVariantInfo } = {
  [SPVariant.RationBag]: {
    title: 'Rations Bags',
    desc: 'Sugar, Flour, Rice, Tea, Pulse/Lentils, Salt, Cooking Oil',
    price: 30,
    maxSupply: 5000,
    subdesc: 'Serves 7-8 people',
    variant: SPVariant.RationBag,
    imageURI: './img/ration.png',
  },
  [SPVariant.TemporaryShelter]: {
    title: 'Temporary Shelters',
    desc: 'Relief tents or sustainable housing made of bamboo sticks',
    price: 100,
    maxSupply: 1000,
    subdesc: 'Serves 1 family or 6-7 people',
    variant: SPVariant.TemporaryShelter,
    imageURI: './img/shelter.png',
  },
  [SPVariant.HygieneKit]: {
    title: 'Hygiene Kits',
    desc: 'Bathing + Laundry Soaps, Menstrual Hygiene Kits, Mosquito Repellent Lotions',
    price: 10,
    maxSupply: 5000,
    subdesc: 'Serves 7-8 people',
    variant: SPVariant.HygieneKit,
    imageURI: './img/hygiene.png',
  },
  [SPVariant.PortableToilets]: {
    title: 'Eco-Friendly Portable Toilets',
    desc: 'An environment-friendly and locally-sourced materials such as bamboo sticks',
    price: 65,
    maxSupply: 1000,
    subdesc: 'Serves at least 5 families',
    variant: SPVariant.PortableToilets,
    imageURI: './img/toilet.png',
  },
  [SPVariant.Water]: {
    title: 'Clean & Safe Water',
    desc: '5 Million Liters',
    price: 35,
    maxSupply: 500,
    subdesc: 'Per 10,000 Liters',
    variant: SPVariant.Water,
    imageURI: './img/water.png',
  },
  [SPVariant.H2OWheel]: {
    title: 'Help-2-Others (H2O) Wheels',
    desc: 'A 40 Liter clean and safe water transporter and storage container',
    price: 25,
    maxSupply: 5000,
    subdesc: '',
    variant: SPVariant.H2OWheel,
    imageURI: './img/water-wheel.png',
  },
}
