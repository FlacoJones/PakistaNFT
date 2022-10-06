import { useQuery } from 'vue-query'
import { Token } from '@/types'
import { useERC20Contract, useSignerOrProvider } from '@/composables'
import { utils } from 'ethers'

interface IUseAllowance {
  token: Token
  owner: string
  spender: string
}

export const useAllowance = ({ token, owner, spender }: IUseAllowance) => {
  const signerOrProvider = useSignerOrProvider()
  const erc20 = useERC20Contract({
    address: token.address,
    signerOrProvider,
  })

  const query = useQuery(
    ['allowance-query', token, spender],
    async () => {
      const allowanceBN = await erc20.allowance(owner, spender)
      const allowance = utils.formatUnits(allowanceBN, token.decimals)
      return allowance
    },
    {
      onError: (error) => console.error(error),
      onSuccess: (data) =>
        console.log(`useAllowance
 | onSuccess | ${data}`),
    }
  )

  return query
}
