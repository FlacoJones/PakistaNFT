import { useQuery } from 'vue-query'
import { SPVariant } from '@/types'
import { SavePakistanUtil } from '@/utils'

interface IUseBalanceOf {
  account?: string | undefined
  variant: SPVariant
}

export const useBalanceOf = ({ account, variant }: IUseBalanceOf) => {
  const query = useQuery(
    ['balance-of-query', account, variant],
    async () => {
      if (!account) {
        return undefined
      }
      const balance = await SavePakistanUtil.GetBalanceOf(account, variant)
      return balance
    },
    {
      onError: (error) => console.error(`useBalanceOf | ${error}`),
      onSuccess: (data) =>
        console.log(`useBalanceOf
 | onSuccess | ${data}`),
      retry: false,
    }
  )

  return query
}
