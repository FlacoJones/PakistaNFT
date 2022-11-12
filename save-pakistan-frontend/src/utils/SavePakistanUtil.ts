import { providers, Signer, utils } from 'ethers'
import { SavePakistan, SavePakistan__factory } from '@/types/contracts'
import { SPVariant } from '@/types'
import { DEFAULT_CHAIN, SAVE_PAKISTAN_CONTRACT_ADDRESS } from '@/constants'
import { Erc20Util } from './Erc20Util'

export class SavePakistanUtil {
  public static GetContract = (
    address?: string | undefined,
    signerOrProvider?: Signer | providers.BaseProvider | undefined
  ): SavePakistan =>
    SavePakistan__factory.connect(
      address ?? SAVE_PAKISTAN_CONTRACT_ADDRESS[DEFAULT_CHAIN.id],
      signerOrProvider ?? providers.getDefaultProvider(DEFAULT_CHAIN.id)
    )

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

  public static GetUSDCAddress = async (
    contractAddress?: string | undefined,
    provider?: providers.BaseProvider | Signer | undefined
  ) => {
    const savePakistanContract = this.GetContract(contractAddress, provider)
    const usdcAddress = await savePakistanContract.usdcAddr()
    return usdcAddress
  }

  public static GetUSDTAddress = async (
    contractAddress?: string | undefined,
    provider?: providers.BaseProvider | Signer | undefined
  ) => {
    const savePakistanContract = this.GetContract(contractAddress, provider)
    const usdtAddress = await savePakistanContract.usdtAddr()
    return usdtAddress
  }

  public static GetVariantMintRate = async (
    variant: SPVariant,
    token: string,
    contractAddress?: string | undefined,
    provider?: providers.BaseProvider | Signer | undefined
  ) => {
    const savePakistanContract = this.GetContract(contractAddress, provider)
    const [rateBN, decimals] = await Promise.all([
      savePakistanContract.getVariantMintRate(variant, token),
      Erc20Util.GetDecimals(token, provider),
    ])
    const rate = Number(utils.formatUnits(rateBN, decimals))
    return rate
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
    token: string,
    quantity: number,
    signer: Signer,
    contractAddress?: string | undefined
  ) => {
    const savePakistanContract = this.GetContract(contractAddress, signer)
    const tx = await savePakistanContract.mintWithToken(variant, token, quantity, {
      gasLimit: 200_000,
    })
    return tx
  }
}
