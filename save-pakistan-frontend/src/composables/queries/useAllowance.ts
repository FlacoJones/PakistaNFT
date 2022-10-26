import { useQuery } from 'vue-query'
import { Token } from '@/types'
import { Erc20Util } from '@/utils'

interface IUseAllowance {
  token: Token
  owner: string
  spender: string
}

export const useAllowance = ({ token, owner, spender }: IUseAllowance) => {
  const query = useQuery(
    ['allowance-query', token, owner, spender],
    async () => {
      if (!token.address) return undefined
      const allowance = await Erc20Util.GetAllowance(owner, spender, token.address)
      return allowance
    },
    {
      onError: (error) => console.error(`useAllowance | ${error}`),
      onSuccess: (data) =>
        console.log(`useAllowance
 | onSuccess | ${data}`),
    }
  )

  return query
}
