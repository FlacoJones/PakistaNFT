import { providers, Signer } from 'ethers'

export type SignerOrProvider = Signer | providers.BaseProvider

export enum NFTVariant {
  RATION,
  MEAL,
  TENT,
  HYGIENE_KIT,
  WATER,
  WATER_WHEEL,
}

export interface Token {
  address: string
  symbol: string
  decimals: number
  name?: string | undefined
  logoURI?: string | undefined
}
