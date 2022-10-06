import { useSignerOrProvider } from '@/composables'
import { PAKISTANFT_CONTRACT_ADDRESS } from '@/constants'
import { PakistaNFT__factory } from '@/types/contracts'

export const usePakistaNftContract = () => {
  const signerOrProvider = useSignerOrProvider()
  const pakistaNftContract = PakistaNFT__factory.connect(
    PAKISTANFT_CONTRACT_ADDRESS,
    signerOrProvider
  )
  return pakistaNftContract
}
