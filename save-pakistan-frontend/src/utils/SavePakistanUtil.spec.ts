import { describe, it, expect } from 'vitest'
import { SAVE_PAKISTAN_TESTNET_CONTRACT_ADDRESS, TESTNET_CHAIN, USDC } from '@/constants'
import { providers, Wallet } from 'ethers'
import { SavePakistanUtil } from './SavePakistanUtil'

describe('SavePakistanUtil', () => {
  const provider = providers.getDefaultProvider(TESTNET_CHAIN.id)

  it('should return correct SP contract instance', async () => {
    const savePakistanContract = SavePakistanUtil.GetContract(
      SAVE_PAKISTAN_TESTNET_CONTRACT_ADDRESS,
      provider
    )
    expect(savePakistanContract.address).toBe(SAVE_PAKISTAN_TESTNET_CONTRACT_ADDRESS)
  })
})
