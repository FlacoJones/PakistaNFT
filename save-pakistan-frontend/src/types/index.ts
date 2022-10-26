import { providers, Signer } from 'ethers'

export type SignerOrProvider = Signer | providers.BaseProvider

export enum SPVariant {
  RationBag,
  TemporaryShelter,
  HygieneKit,
  PortableToilets,
  Water,
  WaterWheel,
}

export interface SPVariantInfo {
  title: string
  desc: string
  price: number
  subdesc?: string | undefined
  variant: SPVariant
  imgSrc?: string | undefined
}

export interface Token {
  address?: string | undefined
  symbol: string
  decimals?: number | undefined
  name?: string | undefined
  logoURI?: string | undefined
}
