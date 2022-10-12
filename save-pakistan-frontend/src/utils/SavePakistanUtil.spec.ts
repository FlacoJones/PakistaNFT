import { describe, it, expect } from 'vitest'
import { SAVE_PAKISTAN_TESTNET_CONTRACT_ADDRESS, TESTNET_CHAIN, USDC } from '@/constants'
import { providers, Wallet } from 'ethers'
import { SavePakistanUtil } from './SavePakistanUtil'
import { SPVariant } from '@/types'

describe('SavePakistanUtil', () => {
  // const token = USDC[TESTNET_CHAIN.id]
  const provider = providers.getDefaultProvider(TESTNET_CHAIN.id)
  const signer = new Wallet(import.meta.env.VITE_PRIVATE_KEY, provider)
  const MaxSchnaider = '0xb1D7daD6baEF98df97bD2d3Fb7540c08886e0299'

  const fetchRationBagBalance = () =>
    SavePakistanUtil.GetBalanceOf(
      MaxSchnaider,
      SPVariant.RationBag,
      SAVE_PAKISTAN_TESTNET_CONTRACT_ADDRESS,
      provider
    )

  const fetchRationBagTotalSupply = () =>
    SavePakistanUtil.GetTotalSupplyForVariant(
      SPVariant.RationBag,
      SAVE_PAKISTAN_TESTNET_CONTRACT_ADDRESS,
      provider
    )

  it('should return correct SP contract instance', async () => {
    const savePakistanContract = SavePakistanUtil.GetContract(
      SAVE_PAKISTAN_TESTNET_CONTRACT_ADDRESS,
      provider
    )
    expect(savePakistanContract.address).toBe(SAVE_PAKISTAN_TESTNET_CONTRACT_ADDRESS)
    expect(await savePakistanContract.symbol()).toBe('SP')
  })

  it('should return total supply for variant', async () => {
    const variantTotalSupply = await fetchRationBagTotalSupply()
    expect(variantTotalSupply).toBeGreaterThanOrEqual(0)
  })

  it('should return total supply for all variants', async () => {
    const variantToTotalSupply = await SavePakistanUtil.GetTotalSupplyForAllVariants(
      SAVE_PAKISTAN_TESTNET_CONTRACT_ADDRESS,
      provider
    )
    expect(Object.keys(variantToTotalSupply).length).toBe(Object.keys(SPVariant).length / 2)
    expect(variantToTotalSupply[SPVariant.RationBag]).toBeGreaterThanOrEqual(0)
    console.log(variantToTotalSupply)
  })

  it('should return balance of account for variant', async () => {
    const balance = await fetchRationBagBalance()
    expect(balance).toBeGreaterThanOrEqual(0)
    console.log(`Balance: ${balance}`)
  })

  it.skip('should mint variant quantity with eth', async () => {
    const quantity = 3

    const initialBalance = await fetchRationBagBalance()
    const initialTotalSupply = await fetchRationBagTotalSupply()

    const mintTx = await SavePakistanUtil.MintWithEth(
      SPVariant.RationBag,
      quantity,
      signer,
      SAVE_PAKISTAN_TESTNET_CONTRACT_ADDRESS
    )
    const receipt = await mintTx.wait()
    expect(receipt.status).toBe(1)

    const newBalance = await fetchRationBagBalance()
    const newTotalSupply = await fetchRationBagTotalSupply()

    expect(newBalance).toBe(initialBalance + quantity)
    expect(newTotalSupply).toBe(initialTotalSupply + quantity)

    console.log(`New balance: ${newBalance}`)
  }, 50000)
})
