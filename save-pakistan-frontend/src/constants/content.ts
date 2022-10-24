import { SPVariant, SPVariantInfo } from '@/types'

export const SP_VARIANT_INFO: { [variant in SPVariant]: SPVariantInfo } = {
  [SPVariant.RationBag]: {
    title: '5,000 Rations Bags',
    desc: 'Sugar, Flour, Rice, Tea, Pulse/Lentils, Salt, Cooking Oil',
    price: 30,
    subdesc: 'Serves 7-8 people',
    variant: SPVariant.RationBag,
    imgSrc: './img/ration.png',
  },
  [SPVariant.PortableToilets]: {
    title: '1,000 Eco-Friendly Portable Toilets',
    desc: 'An environment-friendly and locally-sourced materials such as bamboo sticks.',
    price: 65,
    subdesc: 'Serves at least 5 families',
    variant: SPVariant.PortableToilets,
    imgSrc: './img/toilet.png',
  },
  [SPVariant.HygieneKit]: {
    title: '5,000 Hygiene Kits',
    desc: 'Bathing + Laundry Soaps, Menstrual Hygiene Kits, Mosquito Repellent Lotions',
    price: 10,
    subdesc: 'Serves 7-8 people',
    variant: SPVariant.HygieneKit,
    imgSrc: './img/hygiene.png',
  },
  [SPVariant.Water]: {
    title: '5 Million Liters',
    desc: 'Clean & Safe Water',
    price: 3.5,
    subdesc: 'Per 1,000 Liters',
    variant: SPVariant.Water,
    imgSrc: './img/water.png',
  },
  [SPVariant.TemporaryShelter]: {
    title: '1,000 Temporary Shelters',
    desc: 'Relief tents or sustainable housing made of bamboo sticks',
    price: 100,
    subdesc: 'Serves 1 family or 6-7 people',
    variant: SPVariant.TemporaryShelter,
    imgSrc: './img/shelter.png',
  },
  [SPVariant.WaterWheel]: {
    title: '5,000 Help-2-Others (H2O) Wheels',
    desc: 'A 40 Liter clean and safe water transporter and storage container',
    price: 25,
    subdesc: '',
    variant: SPVariant.WaterWheel,
    imgSrc: './img/water-wheel.png',
  },
}
