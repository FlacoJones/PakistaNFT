import { useERC1155Contract, useSignerOrProvider } from '@/composables'
import { PAKISTANFT_CONTRACT_ADDRESS } from '@/constants'

export const usePakistaNftContract = () => {
  const signerOrProvider = useSignerOrProvider()
  const pakistaNftContract = useERC1155Contract({
    address: PAKISTANFT_CONTRACT_ADDRESS,
    signerOrProvider,
  })
  return pakistaNftContract
}
