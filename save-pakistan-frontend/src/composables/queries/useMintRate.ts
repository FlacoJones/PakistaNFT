import { useQuery } from 'vue-query'
import { SPVariant, Token } from '@/types'
import { SavePakistanUtil } from '@/utils'
import { Ref } from 'vue'
import { BigNumber } from 'ethers'

interface IUseMintRate {
  variant: Ref<SPVariant | undefined>
  token: Ref<Token>
}

export const useMintRate = ({ variant, token }: IUseMintRate) => {
  const query = useQuery(
    ['mint-rate-query', variant, token],
    async () => {
      if (!variant.value) {
        return BigNumber.from(0)
      }
      const mintRate = await SavePakistanUtil.GetVariantMintRate(variant.value, token.value)
      return mintRate
    },
    {
      onError: (error) => console.error(`useMintRate | ${error}`),
      onSuccess: (data) =>
        console.log(`useMintRate
 | onSuccess | ${data}`),
    }
  )

  return query
}
