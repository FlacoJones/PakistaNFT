import { BigNumber, providers, Signer, utils } from 'ethers'
import { SavePakistan, SavePakistan__factory } from '@/types/contracts'
import { SPVariant, Token } from '@/types'
import { DEFAULT_CHAIN, SAVE_PAKISTAN_CONTRACT_ADDRESS } from '@/constants'
import { getProvider } from '@wagmi/core'

export class SavePakistanUtil {
  public static GetContract = (
    address?: string | undefined,
    signerOrProvider?: Signer | providers.BaseProvider | undefined
  ): SavePakistan => {
    const provider = getProvider({ chainId: DEFAULT_CHAIN.id })
    return SavePakistan__factory.connect(
      address ?? SAVE_PAKISTAN_CONTRACT_ADDRESS[DEFAULT_CHAIN.id],
      signerOrProvider ?? provider
    )
  }

  public static GetTotalSupplyForVariant = async (
    variant: SPVariant,
    contractAddress?: string | undefined,
    provider?: providers.BaseProvider | Signer | undefined
  ) => {
    const savePakistanContract = this.GetContract(contractAddress, provider)
    const totalSupplyBN = await savePakistanContract.totalSupply(variant)
    const totalSupply = totalSupplyBN.toNumber()
    return totalSupply
  }

  public static GetTotalSupplyForAllVariants = async (
    contractAddress?: string | undefined,
    provider?: providers.BaseProvider | Signer | undefined
  ) => {
    const savePakistanContract = this.GetContract(contractAddress, provider)
    const variantToTotalSupply: { [variant in SPVariant]?: number } = {}
    await Promise.all(
      Object.keys(SPVariant)
        .slice(0, Object.keys(SPVariant).length / 2)
        .map(async (_, variant) => {
          const totalSupplyBN = await savePakistanContract.totalSupply(variant)
          const totalSupply = totalSupplyBN.toNumber()
          variantToTotalSupply[variant as SPVariant] = totalSupply
        })
    )
    return variantToTotalSupply
  }

  public static GetBalanceOf = async (
    account: string,
    variant: SPVariant,
    contractAddress?: string | undefined,
    provider?: providers.BaseProvider | Signer | undefined
  ) => {
    const savePakistanContract = this.GetContract(contractAddress, provider)
    const balanceBN = await savePakistanContract.balanceOf(account, variant)
    const balance = balanceBN.toNumber()
    return balance
  }

  public static GetVariantMintRate = async (
    variant: SPVariant,
    token: Token,
    contractAddress?: string | undefined,
    provider?: providers.BaseProvider | Signer | undefined
  ) => {
    const savePakistanContract = this.GetContract(contractAddress, provider)
    let mintRate: BigNumber
    if (!token.address) {
      mintRate = await savePakistanContract.getVariantEtherMintRate(variant)
    } else if (token.symbol === 'OP') {
      mintRate = await savePakistanContract.getVariantOptimismMintRate(variant)
    } else {
      mintRate = await savePakistanContract.getVariantMintRate(variant, token.address)
    }
    return mintRate
  }

  public static MintWithEth = async (
    variant: SPVariant,
    quantity: number,
    signer: Signer,
    contractAddress?: string | undefined
  ) => {
    const savePakistanContract = this.GetContract(contractAddress, signer)
    const ethMintRate = await savePakistanContract.getVariantEtherMintRate(variant)
    const tx = await savePakistanContract.mintWithEth(variant, quantity, {
      value: ethMintRate.mul(quantity),
      gasLimit: 200_000,
    })
    return tx
  }

  public static MintWithToken = async (
    variant: SPVariant,
    token: Token,
    quantity: number,
    signer: Signer,
    contractAddress?: string | undefined
  ) => {
    if (!token.address) {
      return this.MintWithEth(variant, quantity, signer, contractAddress)
    }
    const savePakistanContract = this.GetContract(contractAddress, signer)
    const tx = await savePakistanContract.mintWithToken(variant, token.address, quantity, {
      gasLimit: 200_000,
    })
    return tx
  }
}
