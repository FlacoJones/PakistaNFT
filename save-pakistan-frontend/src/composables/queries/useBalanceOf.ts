import { useQuery } from 'vue-query'
import { SPVariant } from '@/types'
import { SavePakistanUtil } from '@/utils'
import { Ref } from 'vue'

interface IUseBalanceOf {
  account: Ref<string | undefined>
  variant: Ref<SPVariant | undefined>
}

export const useBalanceOf = ({ account, variant }: IUseBalanceOf) => {
  const query = useQuery(
    ['balance-of-query', account, variant],
    async () => {
      if (!account.value || variant.value === undefined) {
        return undefined
      }
      const balance = await SavePakistanUtil.GetBalanceOf(account.value, variant.value)
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
