import { useQuery } from 'vue-query'
import { SPVariant } from '@/types'
import { SavePakistanUtil } from '@/utils'

interface ITotalSupplyForVariant {
  variant: SPVariant
}

export const useTotalSupplyForVariant = ({ variant }: ITotalSupplyForVariant) => {
  const query = useQuery(
    ['total-supply-for-variant-query', variant],
    async () => {
      const totalSupply = await SavePakistanUtil.GetTotalSupplyForVariant(variant)
      return totalSupply
    },
    {
      onError: (error) => console.error(`useTotalSupplyForVariant | ${error}`),
      onSuccess: (data) =>
        console.log(`useTotalSupplyForVariant
 | onSuccess | ${data}`),
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
    }
  )

  return query
}
