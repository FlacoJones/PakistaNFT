import { SignerOrProvider } from '@/types'
import { Erc20Util } from '@/utils'

interface IUseErc20Contract {
  signerOrProvider: SignerOrProvider
  address: string
}

export const useErc20Contract = ({ signerOrProvider, address }: IUseErc20Contract) => {
  const erc20Contract = Erc20Util.GetContract(signerOrProvider, address)
  return erc20Contract
}
