import { describe, it, expect } from 'vitest'
import { OP, MAINNET_CHAIN } from '@/constants'
import { Erc20Util } from '@/utils'
import { providers, Wallet } from 'ethers'

describe('Erc20Util', () => {
  const opTokenAddress = OP[MAINNET_CHAIN.id].address!
  const provider = new providers.AlchemyProvider(
    { chainId: MAINNET_CHAIN.id, name: MAINNET_CHAIN.name },
    import.meta.env.VITE_ALCHEMY_ID
  )
  const signer = new Wallet(import.meta.env.VITE_PRIVATE_KEY, provider)
  const MaxSchnaider = '0xb1D7daD6baEF98df97bD2d3Fb7540c08886e0299'
  const spender = '0x660FBab221eCD6F915a2b10e91471E7315A9FEC4'

  it('should return correct erc20 instance', async () => {
    const erc20Contract = Erc20Util.GetContract(opTokenAddress, provider)
    expect(erc20Contract.address).toBe(opTokenAddress)
  })

  it('should return balance of account', async () => {
    const balance = await Erc20Util.GetBalanceOf(MaxSchnaider, opTokenAddress, provider)
    // console.log(`Balance: ${balance} ${token.symbol}`)
    expect(balance).toBeGreaterThanOrEqual(0)
  })

  it('should return allowance for spender', async () => {
    const allowance = await Erc20Util.GetAllowance(MaxSchnaider, spender, opTokenAddress, provider)
    // console.log(`Allowance: ${allowance} ${token.symbol}`)
    expect(allowance).toBeGreaterThanOrEqual(0)
  })

  it.skip('should approve spender for new allowance', async () => {
    const currentAllowance = await Erc20Util.GetAllowance(
      MaxSchnaider,
      spender,
      opTokenAddress,
      provider
    )
    const approveTx = await Erc20Util.Approve(
      spender,
      currentAllowance.add(1),
      opTokenAddress,
      signer
    )
    const receipt = await approveTx.wait()
    expect(receipt.status).toBe(1)

    const newAllowance = await Erc20Util.GetAllowance(
      MaxSchnaider,
      spender,
      opTokenAddress,
      provider
    )
    // console.log(`New allowance: ${newAllowance} ${token.symbol}`)
    expect(newAllowance.gt(currentAllowance)).toBe(true)
  }, 30000)
})
