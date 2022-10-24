import { SignerOrProvider } from '@/types'
import { Erc20Util } from '@/utils'

interface IUseErc20Contract {
  address: string
  signerOrProvider: SignerOrProvider
}

export const useErc20Contract = ({ address, signerOrProvider }: IUseErc20Contract) => {
  const erc20Contract = Erc20Util.GetContract(address, signerOrProvider)
  return erc20Contract
}
