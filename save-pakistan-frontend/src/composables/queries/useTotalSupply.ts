import { useQuery } from 'vue-query'
import { SPVariant } from '@/types'
import { SavePakistanUtil } from '@/utils'
import { Ref } from 'vue'

interface IUseTotalSupplyForVariant {
  variant: Ref<SPVariant | undefined>
}

export const useTotalSupplyForVariant = ({ variant }: IUseTotalSupplyForVariant) => {
  const query = useQuery(
    ['total-supply-for-variant-query', variant],
    async () => {
      if (variant.value === undefined) {
        return 0
      }
      const totalSupply = await SavePakistanUtil.GetTotalSupplyForVariant(variant.value)
      return totalSupply
    },
    {
      onError: (error) => console.error(`useTotalSupplyForVariant | ${error}`),
      onSuccess: (data) =>
        console.log(`useTotalSupplyForVariant
 | onSuccess | ${data}`),
      retry: false,
    }
  )

  return query
}

export const useTotalSupplyForAllVariants = () => {
  const query = useQuery(
    ['total-supply-for-all-variants-query'],
    async () => {
      const variantToTotalSupply = await SavePakistanUtil.GetTotalSupplyForAllVariants()
      return variantToTotalSupply
    },
    {
      onError: (error) => console.error(`useTotalSupplyForAllVariants | ${error}`),
      onSuccess: (data) =>
        console.log(`useTotalSupplyForAllVariants
 | onSuccess | ${data}`),
      retry: false,
    }
  )

  return query
}
