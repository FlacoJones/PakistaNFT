import { chain } from 'vagmi'

export const TESTNET_CHAIN = chain.goerli
export const MAINNET_CHAIN = chain.optimism
export const DEFAULT_CHAIN = MAINNET_CHAIN

export const SUPPORTED_CHAINS = [MAINNET_CHAIN, TESTNET_CHAIN]
