import { SignerOrProvider } from '@/types'
import { ERC20__factory } from '@/types/contracts'

interface IUseERC20Contract {
  address: string
  signerOrProvider: SignerOrProvider
}

export const useERC20Contract = ({ address, signerOrProvider }: IUseERC20Contract) =>
  ERC20__factory.connect(address, signerOrProvider)
