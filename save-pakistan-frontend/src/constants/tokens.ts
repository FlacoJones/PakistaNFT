import { Token } from '@/types'
import { DEFAULT_CHAIN, TESTNET_CHAIN } from '@/constants'

export const USDC: { [chainId: number]: Token } = {
  [DEFAULT_CHAIN.id]: {
    symbol: 'USDC',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6,
    name: 'USD Coin',
    logoURI: '',
  },
  [TESTNET_CHAIN.id]: {
    symbol: 'USDC',
    address: '0x07865c6E87B9F70255377e024ace6630C1Eaa37F',
    decimals: 6,
    name: 'USD Coin',
    logoURI: '',
  },
}

export const USDT: { [chainId: number]: Token } = {
  [DEFAULT_CHAIN.id]: {
    symbol: 'USDT',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 18,
    name: 'Tether USD',
    logoURI: '',
  },
  [TESTNET_CHAIN.id]: {
    symbol: 'USDT',
    address: '0xe802376580c10fE23F027e1E19Ed9D54d4C9311e',
    decimals: 18,
    name: 'Tether USD',
    logoURI: '',
  },
}
