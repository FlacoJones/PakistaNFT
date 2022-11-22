import { useQuery } from 'vue-query'
import { Token } from '@/types'
import { Erc20Util } from '@/utils'
import { Ref } from 'vue'
import { BigNumber } from 'ethers'

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
        return BigNumber.from(0)
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

  return query
}
