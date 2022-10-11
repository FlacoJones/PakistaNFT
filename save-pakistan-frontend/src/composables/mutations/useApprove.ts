import { useMutation } from 'vue-query'
import { Token } from '@/types'
import { useSigner } from 'vagmi'
import { Erc20Util } from '@/utils'

interface IUseApprove {
  spender: string
  value: string
  token: Token
}

export const useApprove = () => {
  const { data: signer } = useSigner()

  const mutation = useMutation(
    async ({ token, spender, value }: IUseApprove) => {
      if (!signer.value) {
        return
      }
      const tx = await Erc20Util.Approve(spender, value, token, signer.value)
      return tx
    },
    {
      onError: (error) => console.error(`useApprove | ${error}`),
      onSuccess: (data) => console.log(`useApprove | onSuccess | ${data}`),
    }
  )

  return mutation
}
