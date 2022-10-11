import { providers, Signer } from 'ethers'

export type SignerOrProvider = Signer | providers.BaseProvider

export enum SPVariant {
  RationBag = 0,
  TemporaryShelter,
  HygieneKit,
  PortableToilets,
  Water,
  WaterWheel,
}

export interface Token {
  address: string
  symbol: string
  decimals: number
  name?: string | undefined
  logoURI?: string | undefined
}
