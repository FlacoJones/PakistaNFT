import { describe, it, expect } from 'vitest'
import { OP, SAVE_PAKISTAN_CONTRACT_ADDRESS, MAINNET_CHAIN, SP_VARIANT_INFO } from '@/constants'
import { providers, Wallet } from 'ethers'
import { SavePakistanUtil } from './SavePakistanUtil'
import { SPVariant } from '@/types'
import { Erc20Util } from './Erc20Util'

describe('SavePakistanUtil', () => {
  const provider = new providers.AlchemyProvider(
    { chainId: MAINNET_CHAIN.id, name: MAINNET_CHAIN.name },
    import.meta.env.VITE_ALCHEMY_ID
  )
  const signer = new Wallet(import.meta.env.VITE_PRIVATE_KEY, provider)
  const MaxSchnaider = '0xb1D7daD6baEF98df97bD2d3Fb7540c08886e0299'
  const opToken = OP[MAINNET_CHAIN.id]!

  const fetchRationBagBalance = () =>
    SavePakistanUtil.GetBalanceOf(
      MaxSchnaider,
      SPVariant.RationBag,
      SAVE_PAKISTAN_CONTRACT_ADDRESS[MAINNET_CHAIN.id],
      provider
    )

  const fetchRationBagTotalSupply = () =>
    SavePakistanUtil.GetTotalSupplyForVariant(
      SPVariant.RationBag,
      SAVE_PAKISTAN_CONTRACT_ADDRESS[MAINNET_CHAIN.id],
      provider
    )

  const fetachRationBagMintRate = () =>
    SavePakistanUtil.GetVariantMintRate(
      SPVariant.RationBag,
      opToken,
      SAVE_PAKISTAN_CONTRACT_ADDRESS[MAINNET_CHAIN.id],
      provider
    )

  it('should return correct SP contract instance', async () => {
    const savePakistanContract = SavePakistanUtil.GetContract(
      SAVE_PAKISTAN_CONTRACT_ADDRESS[MAINNET_CHAIN.id],
      provider
    )
    expect(savePakistanContract.address).toBe(SAVE_PAKISTAN_CONTRACT_ADDRESS[MAINNET_CHAIN.id])
    expect(await savePakistanContract.symbol()).toBe('SP')
  })

  it('should return total supply for variant', async () => {
    const variantTotalSupply = await fetchRationBagTotalSupply()
    expect(variantTotalSupply).toBeGreaterThanOrEqual(0)
    console.log(variantTotalSupply)
  })

  it('should return total supply for all variants', async () => {
    const variantToTotalSupply = await SavePakistanUtil.GetTotalSupplyForAllVariants(
      SAVE_PAKISTAN_CONTRACT_ADDRESS[MAINNET_CHAIN.id],
      provider
    )
    expect(Object.keys(variantToTotalSupply).length).toBe(Object.keys(SPVariant).length / 2)
    expect(variantToTotalSupply[SPVariant.RationBag]).toBeGreaterThanOrEqual(0)
    console.log(variantToTotalSupply)
  }, 20000)

  it('should return balance of account for variant', async () => {
    const balance = await fetchRationBagBalance()
    expect(balance).toBeGreaterThanOrEqual(0)
    console.log(`Balance: ${balance}`)
  })

  it('should return variant mint rate for token', async () => {
    const rate = await fetachRationBagMintRate()
    expect(rate).toBe(SP_VARIANT_INFO[SPVariant.RationBag])
  })

  it.skip('should mint variant quantity with eth', async () => {
    const quantity = 3

    const initialBalance = await fetchRationBagBalance()
    const initialTotalSupply = await fetchRationBagTotalSupply()

    const mintTx = await SavePakistanUtil.MintWithEth(
      SPVariant.RationBag,
      quantity,
      signer,
      SAVE_PAKISTAN_CONTRACT_ADDRESS[MAINNET_CHAIN.id]
    )

    const receipt = await mintTx.wait()
    expect(receipt.status).toBe(1)

    const newBalance = await fetchRationBagBalance()
    const newTotalSupply = await fetchRationBagTotalSupply()

    expect(newBalance).toBe(initialBalance + quantity)
    expect(newTotalSupply).toBe(initialTotalSupply + quantity)

    console.log(`New balance: ${newBalance}`)
  }, 100000)

  it.skip('should fail mint with usdc on no allowance', async () => {
    const quantity = 2

    const initialBalance = await fetchRationBagBalance()
    const initialTotalSupply = await fetchRationBagTotalSupply()

    const mintTx = await SavePakistanUtil.MintWithToken(
      SPVariant.RationBag,
      opToken,
      quantity,
      signer,
      SAVE_PAKISTAN_CONTRACT_ADDRESS[MAINNET_CHAIN.id]
    )

    const receipt = await mintTx.wait()
    expect(receipt.status).toBe(0)

    const newBalance = await fetchRationBagBalance()
    const newTotalSupply = await fetchRationBagTotalSupply()

    expect(newBalance).toBe(initialBalance)
    expect(newTotalSupply).toBe(initialTotalSupply)
  }, 30000)

  it.skip('should mint variant quantity with token', async () => {
    const quantity = 2

    const initialBalance = await fetchRationBagBalance()
    const initialTotalSupply = await fetchRationBagTotalSupply()

    const rate = await fetachRationBagMintRate()
    const amount = rate.mul(quantity)

    const approveTx = await Erc20Util.Approve(
      SAVE_PAKISTAN_CONTRACT_ADDRESS[MAINNET_CHAIN.id],
      amount,
      opToken.address!,
      signer
    )
    await approveTx.wait()

    const mintTx = await SavePakistanUtil.MintWithToken(
      SPVariant.RationBag,
      opToken,
      quantity,
      signer,
      SAVE_PAKISTAN_CONTRACT_ADDRESS[MAINNET_CHAIN.id]
    )

    const receipt = await mintTx.wait()
    expect(receipt.status).toBe(1)

    const newBalance = await fetchRationBagBalance()
    const newTotalSupply = await fetchRationBagTotalSupply()

    expect(newBalance).toBe(initialBalance + quantity)
    expect(newTotalSupply).toBe(initialTotalSupply + quantity)

    console.log(`New balance: ${newBalance}`)
  }, 100000)
})
