import { usePakistaNftContract } from '@/composables/contracts'
import { useMutation } from 'vue-query'

interface IUseMint {
  account?: string | undefined
  tokenType: number
  amount: number
}

export const useMint = () => {
  const pakistaNftContract = usePakistaNftContract()

  const mutation = useMutation(
    async ({ account, tokenType, amount }: IUseMint) => {
      if (!account) return
      const tx = await pakistaNftContract.mint(account, tokenType, amount)
      return tx
    },
    {
      onError: (error) => console.error(error),
      onSuccess: (data) => console.log(`useMint | onSuccess | ${data}`),
    }
  )

  return mutation
}
