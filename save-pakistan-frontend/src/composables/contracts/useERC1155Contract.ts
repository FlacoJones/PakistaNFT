import { SignerOrProvider } from '@/types'
import { ERC1155__factory } from '@/types/contracts'

interface IUseERC1155Contract {
  address: string
  signerOrProvider: SignerOrProvider
}

export const useERC1155Contract = ({ address, signerOrProvider }: IUseERC1155Contract) =>
  ERC1155__factory.connect(address, signerOrProvider)
