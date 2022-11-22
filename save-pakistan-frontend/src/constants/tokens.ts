import { Token } from '@/types'
import { MAINNET_CHAIN, TESTNET_CHAIN } from '@/constants'

export const ETH: Token = {
  symbol: 'ETH',
  logoURI: '/img/eth.svg',
}

export const USDC: { [chainId: number]: Token } = {
  [MAINNET_CHAIN.id]: {
    symbol: 'USDC',
    address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
    decimals: 6,
    name: 'USD Coin',
    logoURI: '/img/usdc.svg',
  },
  [TESTNET_CHAIN.id]: {
    symbol: 'USDC',
    address: '0x596a8d9270Ac527dB25C61D810ae04E5b41DaC8c',
    decimals: 6,
    name: 'USD Coin',
    logoURI: '/img/usdc.svg',
  },
}

export const USDT: { [chainId: number]: Token } = {
  [MAINNET_CHAIN.id]: {
    symbol: 'USDT',
    address: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
    decimals: 18,
    name: 'Tether USD',
    logoURI: '/img/usdt.svg',
  },
  [TESTNET_CHAIN.id]: {
    symbol: 'USDT',
    address: '0x2B3A924177B3C2B4EC74B31A475a90c17F7bE090',
    decimals: 18,
    name: 'Tether USD',
    logoURI: '/img/usdt.svg',
  },
}

export const OP: { [chainId: number]: Token } = {
  [MAINNET_CHAIN.id]: {
    symbol: 'OP',
    address: '0x4200000000000000000000000000000000000042',
    decimals: 18,
    name: 'Optimism',
    logoURI: '/img/op.svg',
  },
  [TESTNET_CHAIN.id]: {
    symbol: 'OP',
    address: '0x99A71453dbf1baaBe8a3864221fB335E34759386',
    decimals: 18,
    name: 'Optimism',
    logoURI: '/img/op.svg',
  },
}

export const TOKENS: { [chainId: number]: Token[] } = {
  [MAINNET_CHAIN.id]: [ETH, USDC[MAINNET_CHAIN.id], USDT[MAINNET_CHAIN.id], OP[MAINNET_CHAIN.id]],
  [TESTNET_CHAIN.id]: [ETH, USDC[TESTNET_CHAIN.id], USDT[TESTNET_CHAIN.id], OP[TESTNET_CHAIN.id]],
}
