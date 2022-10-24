import { describe, it, expect } from 'vitest'
import { TESTNET_CHAIN } from '@/constants'
import { Erc20Util } from '@/utils'
import { providers, Wallet } from 'ethers'

describe('Erc20Util', () => {
  const usdtAddress = '0x2406B9982746D8dc9385600Ea0E4be385C5d4357'
  const provider = providers.getDefaultProvider(TESTNET_CHAIN.id)
  const signer = new Wallet(import.meta.env.VITE_PRIVATE_KEY, provider)
  const MaxSchnaider = '0xb1D7daD6baEF98df97bD2d3Fb7540c08886e0299'
  const spender = '0x660FBab221eCD6F915a2b10e91471E7315A9FEC4'

  it('should return correct erc20 instance', async () => {
    const erc20Contract = Erc20Util.GetContract(usdtAddress, provider)
    expect(erc20Contract.address).toBe(usdtAddress)
  })

  it('should return balance of account', async () => {
    const balance = await Erc20Util.GetBalanceOf(MaxSchnaider, usdtAddress, provider)
    // console.log(`Balance: ${balance} ${token.symbol}`)
    expect(balance).toBeGreaterThanOrEqual(0)
  })

  it('should return allowance for spender', async () => {
    const allowance = await Erc20Util.GetAllowance(MaxSchnaider, spender, usdtAddress, provider)
    // console.log(`Allowance: ${allowance} ${token.symbol}`)
    expect(allowance).toBeGreaterThanOrEqual(0)
  })

  it.skip('should approve spender for new allowance', async () => {
    const currentAllowance = await Erc20Util.GetAllowance(
      MaxSchnaider,
      spender,
      usdtAddress,
      provider
    )
    const approveTx = await Erc20Util.Approve(
      spender,
      (currentAllowance + 1).toString(),
      usdtAddress,
      signer
    )
    const receipt = await approveTx.wait()
    expect(receipt.status).toBe(1)

    const newAllowance = await Erc20Util.GetAllowance(MaxSchnaider, spender, usdtAddress, provider)
    // console.log(`New allowance: ${newAllowance} ${token.symbol}`)
    expect(newAllowance).toBeGreaterThan(currentAllowance)
  }, 30000)
})
