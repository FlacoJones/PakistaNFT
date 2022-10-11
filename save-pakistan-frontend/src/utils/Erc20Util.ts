import { providers, Signer, utils } from 'ethers'
import { ERC20, ERC20__factory } from '@/types/contracts'
import { Token } from '@/types'
import { DEFAULT_CHAIN } from '@/constants'

export class Erc20Util {
  public static GetContract = (
    address: string,
    signerOrProvider?: Signer | providers.BaseProvider | undefined
  ): ERC20 =>
    ERC20__factory.connect(
      address,
      signerOrProvider ?? providers.getDefaultProvider(DEFAULT_CHAIN.id)
    )

  public static GetAllowance = async (
    owner: string,
    spender: string,
    token: Token,
    provider?: providers.BaseProvider | Signer | undefined
  ) => {
    const erc20Contract = this.GetContract(token.address, provider)
    const allowanceBN = await erc20Contract.allowance(owner, spender)
    const allowance = Number(utils.formatUnits(allowanceBN, token.decimals))
    return allowance
  }

  public static GetBalanceOf = async (
    account: string,
    token: Token,
    provider?: providers.BaseProvider | Signer | undefined
  ) => {
    const erc20Contract = this.GetContract(token.address, provider)
    const balanceBN = await erc20Contract.balanceOf(account)
    const balance = Number(utils.formatUnits(balanceBN, token.decimals))
    return balance
  }

  public static Approve = async (spender: string, value: string, token: Token, signer: Signer) => {
    const erc20Contract = this.GetContract(token.address, signer)
    const valueBN = utils.parseUnits(value, token.decimals)
    const tx = await erc20Contract.approve(spender, valueBN, { gasLimit: 200_000 })
    return tx
  }
}
