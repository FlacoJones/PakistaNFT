import { useSavePakistanContract } from '@/composables'
import { BigNumber } from 'ethers'
import { useMutation } from 'vue-query'
import { NFTVariant, Token } from '@/types'

interface IUseMint {
  nftVariant: NFTVariant
  amount: number
}

export const useEthMint = () => {
  const pakistaNftContract = useSavePakistanContract()

  const mutation = useMutation(
    async ({ nftVariant, amount }: IUseMint) => {
      const ethPrice = await pakistaNftContract.ETHER_MINT_RATE(BigNumber.from(nftVariant))
      const tx = await pakistaNftContract.etherMint(nftVariant, amount, {
        value: ethPrice.mul(amount),
        gasLimit: 200_000,
      })
      return tx
    },
    {
      onError: (error) => console.error(error),
      onSuccess: (data) => console.log(`useMint | onSuccess | ${data}`),
    }
  )

  return mutation
}

export const useUsdcMint = () => {
  const pakistaNftContract = useSavePakistanContract()

  const mutation = useMutation(
    async ({ nftVariant, amount }: IUseMint) => {
      const usdcPrice = await pakistaNftContract.USDC_MINT_RATE(BigNumber.from(nftVariant))
      const tx = await pakistaNftContract.erc20Mint(nftVariant, usdcPrice.mul(amount), 'USDC', {
        gasLimit: 200_000,
      })
      return tx
    },
    {
      onError: (error) => console.error(error),
      onSuccess: (data) => console.log(`useMint | onSuccess | ${data}`),
    }
  )

  return mutation
}
