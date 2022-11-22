import { useMutation } from 'vue-query'
import { Token } from '@/types'
import { fetchSigner } from '@wagmi/core'
import { Erc20Util } from '@/utils'
import { BigNumber } from 'ethers'

interface IUseApprove {
  spender: string
  value: BigNumber | undefined
  token: Token
}

export const useApprove = () => {
  const mutation = useMutation(
    async ({ token, spender, value }: IUseApprove) => {
      const signer = await fetchSigner()
      if (!signer || !token.address || !value) {
        return
      }
      const tx = await Erc20Util.Approve(spender, value, token.address, signer)
      return tx
    },
    {
      onError: (error) => console.error(`useApprove | ${error}`),
      onSuccess: (data) => console.log(`useApprove | onSuccess | ${data}`),
    }
  )

  return mutation
}
