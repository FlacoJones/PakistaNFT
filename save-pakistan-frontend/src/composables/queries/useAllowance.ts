import { useQuery } from 'vue-query'
import { Token } from '@/types'
import { Erc20Util } from '@/utils'
import { computed, Ref } from 'vue'

interface IUseAllowance {
  token: Ref<Token | undefined>
  owner: Ref<string | undefined>
  spender: Ref<string | undefined>
  refetchInterval?: Ref<number | false>
}

export const useAllowance = ({ token, owner, spender, refetchInterval }: IUseAllowance) => {
  const query = useQuery(
    ['allowance-query', token, owner, spender],
    async () => {
      if (!token?.value?.address || !owner?.value || !spender?.value) {
        return 0
      }
      const allowance = await Erc20Util.GetAllowance(
        owner.value,
        spender.value,
        token.value.address
      )
      return allowance
    },
    {
      onError: (error) => console.error(`useAllowance | ${error}`),
      onSuccess: (data) =>
        console.log(`useAllowance
 | onSuccess | ${data}`),
      refetchInterval,
    }
  )

  // const erc20Contract = computed(() =>
  //   !!token?.value?.address ? Erc20Util.GetContract(token.value.address) : undefined
  // )
  // erc20Contract.value?.on('Approval', (owner, spender, value) => {
  //   console.log('ON_APPROVAL', owner, spender, value)
  // })

  return query
}
