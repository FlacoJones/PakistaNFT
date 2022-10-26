import { useSignerOrProvider } from '@/composables'
import { SavePakistanUtil } from '@/utils'
import { DEFAULT_CHAIN, SAVE_PAKISTAN_CONTRACT_ADDRESS } from '@/constants'

export const useSavePakistanContract = () => {
  const signerOrProvider = useSignerOrProvider()
  const savePakistanContract = SavePakistanUtil.GetContract(
    SAVE_PAKISTAN_CONTRACT_ADDRESS[DEFAULT_CHAIN.id],
    signerOrProvider
  )
  return savePakistanContract
}
