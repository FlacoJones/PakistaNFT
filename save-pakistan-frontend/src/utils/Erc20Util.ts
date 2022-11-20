import { providers, Signer, utils } from 'ethers'
import { ERC20, ERC20__factory } from '@/types/contracts'
import { DEFAULT_CHAIN } from '@/constants'
import { getProvider } from '@wagmi/core'

const alchemyId = import.meta.env.VITE_ALCHEMY_ID
export class Erc20Util {
  public static GetContract = (
    address: string,
    signerOrProvider?: Signer | providers.BaseProvider | undefined
  ): ERC20 => {
    const provider = getProvider({ chainId: DEFAULT_CHAIN.id })
    return ERC20__factory.connect(address, signerOrProvider ?? provider)
  }

  public static GetAllowance = async (
    owner: string,
    spender: string,
    token: string,
    provider?: providers.BaseProvider | Signer | undefined
  ) => {
    const erc20Contract = this.GetContract(token, provider)
    const [allowanceBN, decimals] = await Promise.all([
      erc20Contract.allowance(owner, spender),
      erc20Contract.decimals(),
    ])
    const allowance = Number(utils.formatUnits(allowanceBN, decimals))
    return allowance
  }

  public static GetBalanceOf = async (
    account: string,
    token: string,
    provider?: providers.BaseProvider | Signer | undefined
  ) => {
    const erc20Contract = this.GetContract(token, provider)
    const [balanceBN, decimals] = await Promise.all([
      erc20Contract.balanceOf(account),
      erc20Contract.decimals(),
    ])
    const balance = Number(utils.formatUnits(balanceBN, decimals))
    return balance
  }

  public static GetDecimals = async (
    token: string,
    provider?: providers.BaseProvider | Signer | undefined
  ) => {
    const erc20Contract = this.GetContract(token, provider)
    const decimals = erc20Contract.decimals()
    return decimals
  }

  public static Approve = async (spender: string, value: string, token: string, signer: Signer) => {
    const erc20Contract = this.GetContract(token, signer)
    const decimals = await erc20Contract.decimals()
    const valueBN = utils.parseUnits(value, decimals)
    const tx = await erc20Contract.approve(spender, valueBN, { gasLimit: 200_000 })
    return tx
  }
}
