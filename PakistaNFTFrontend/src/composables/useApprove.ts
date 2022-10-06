import { useMutation } from 'vue-query'
import { Token } from '@/types'
import { useSigner } from 'vagmi'
import { ERC20__factory } from '@/types/contracts'
import { utils } from 'ethers'

interface IUseApprove {
  token: Token
  spender: string
  value: string | number
}

export const useApprove = () => {
  const { data: signer } = useSigner()

  const mutation = useMutation(
    async ({ token, spender, value }: IUseApprove) => {
      if (!signer.value) {
        return
      }
      const tokenContract = ERC20__factory.connect(token.address, signer.value)
      const valueBN = utils.parseUnits(Number(value).toString(), token.decimals)
      const tx = await tokenContract.approve(spender, valueBN, { gasLimit: 200_000 })
      return tx
    },
    {
      onError: (error) => console.error(error),
      onSuccess: (data) => console.log(`useApprove | onSuccess | ${data}`),
    }
  )

  return mutation
}
