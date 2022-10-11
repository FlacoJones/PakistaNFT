import { useSignerOrProvider } from '@/composables'
import { SavePakistanUtil } from '@/utils'

export const useSavePakistanContract = () => {
  const signerOrProvider = useSignerOrProvider()
  const savePakistanContract = SavePakistanUtil.GetContract(signerOrProvider)
  return savePakistanContract
}
