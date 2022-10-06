import { useSignerOrProvider } from '@/composables'
import { PAKISTANFT_CONTRACT_ADDRESS } from '@/constants'
import { PakistaNFT__factory } from '../../types/contracts'

export const usePakistaNftContract = () => {
  const signerOrProvider = useSignerOrProvider()
  // const pakistaNftContract = useERC1155Contract({
  //   address: PAKISTANFT_CONTRACT_ADDRESS,
  //   signerOrProvider,
  // })
  const pakistaNftContract = PakistaNFT__factory.connect(
    PAKISTANFT_CONTRACT_ADDRESS,
    signerOrProvider
  )
  return pakistaNftContract
}
