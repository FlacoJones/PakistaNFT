import { useMutation } from 'vue-query'
import { SPVariant, Token } from '@/types'
import { SavePakistanUtil } from '@/utils'
import { useSigner } from 'vagmi'

interface IMint {
  variant: SPVariant
  quantity: number
}

export const useMintWithEth = () => {
  const { data: signer } = useSigner()

  const mutation = useMutation(
    async ({ variant, quantity }: IMint) => {
      if (!signer.value) {
        return
      }
      const tx = await SavePakistanUtil.MintWithEth(variant, quantity, signer.value)
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
  const { data: signer } = useSigner()

  const mutation = useMutation(
    async ({ token, variant, quantity }: IMintWithToken) => {
      if (!signer.value || !token.address) {
        return
      }
      const tx = await SavePakistanUtil.MintWithToken(
        variant,
        token.address,
        quantity,
        signer.value
      )
      return tx
    },
    {
      onError: (error) => console.error(`useMintWithToken | ${error}`),
      onSuccess: (data) => console.log(`useMintWithToken | onSuccess | ${data}`),
    }
  )

  return mutation
}
