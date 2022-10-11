import { useSignerOrProvider } from '@/composables'
import { SAVE_PAKISTAN_CONTRACT_ADDRESS } from '@/constants'
import { PakistaNFT__factory } from '@/types/contracts'

export const useSavePakistanContract = () => {
  const signerOrProvider = useSignerOrProvider()
  const pakistaNftContract = PakistaNFT__factory.connect(
    SAVE_PAKISTAN_CONTRACT_ADDRESS,
    signerOrProvider
  )
  return pakistaNftContract
}
