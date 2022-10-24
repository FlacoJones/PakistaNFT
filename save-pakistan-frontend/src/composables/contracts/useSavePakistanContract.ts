import { useSignerOrProvider } from '@/composables'
import { SavePakistanUtil } from '@/utils'
import { SAVE_PAKISTAN_CONTRACT_ADDRESS } from '@/constants'

export const useSavePakistanContract = () => {
  const signerOrProvider = useSignerOrProvider()
  const savePakistanContract = SavePakistanUtil.GetContract(
    SAVE_PAKISTAN_CONTRACT_ADDRESS,
    signerOrProvider
  )
  return savePakistanContract
}
