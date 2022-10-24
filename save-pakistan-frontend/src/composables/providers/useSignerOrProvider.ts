import { DEFAULT_CHAIN } from '@/constants'
import { SignerOrProvider } from '@/types'
import { providers } from 'ethers'
import { useSigner } from 'vagmi'
import { computed } from 'vue'

export const useSignerOrProvider = (): SignerOrProvider => {
  const { data: signer } = useSigner()
  const provider = providers.getDefaultProvider(DEFAULT_CHAIN.id)
  const signerOrProvider = computed(() => signer.value ?? provider)
  return signerOrProvider.value
}
