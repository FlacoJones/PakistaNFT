import { useMutation } from 'vue-query'
import { SPVariant, Token } from '@/types'
import { SavePakistanUtil } from '@/utils'
import { fetchSigner } from '@wagmi/core'

interface IMint {
  variant: SPVariant
  quantity: number
}

export const useMintWithEth = () => {
  const mutation = useMutation(
    async ({ variant, quantity }: IMint) => {
      const signer = await fetchSigner()
      if (!signer) {
        return
      }

      const tx = await SavePakistanUtil.MintWithEth(variant, quantity, signer)
      return tx
    },
    {
      onError: (error) => console.error(`useMintWithEth | ${error}`),
      onSuccess: (data) => console.log(`useMintWithEth | onSuccess | ${data}`),
    }
  )

  return mutation
}

interface IMintWithToken extends IMint {
  token: Token
}

export const useMintWithToken = () => {
  const mutation = useMutation(
    async ({ token, variant, quantity }: IMintWithToken) => {
      const signer = await fetchSigner()
      if (!signer || !token.address) {
        return
      }

      const tx = await SavePakistanUtil.MintWithToken(variant, token.address, quantity, signer)
      return tx
    },
    {
      onError: (error) => console.error(`useMintWithToken | ${error}`),
      onSuccess: (data) => console.log(`useMintWithToken | onSuccess | ${data}`),
    }
  )

  return mutation
}
