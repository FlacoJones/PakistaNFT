<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  DEFAULT_CHAIN,
  SP_VARIANT_INFO,
  ETH,
  TOKENS,
  SAVE_PAKISTAN_CONTRACT_ADDRESS,
} from '@/constants'
import {
  useAccount,
  useBalance,
  useConnect,
  useNetwork,
  useSwitchNetwork,
  useWaitForTransaction,
} from 'vagmi'
import { useStore } from '@/store'
import { storeToRefs } from 'pinia'
import { useAllowance, useApprove, useMintWithEth, useMintWithToken } from '@/composables'
import { Token } from '@/types'

import ConnectWalletModal from '@/components/ConnectWalletModal.vue'
import TxSubmittedModal from '@/components/TxSubmittedModal.vue'
import ChevronDownIcon from '@/components/icons/ChevronDownIcon.vue'

/**
 * variant
 */
const store = useStore()
const { selectedVariant } = storeToRefs(store)
const variantInfo = computed(() => SP_VARIANT_INFO[selectedVariant.value ?? 0])

/**
 *  connect wallet
 */
const { connect, connectors } = useConnect()
const [metamask] = connectors.value

const isConnectWalletModalOpen = ref(false)
const showConnectButtonModal = () => {
  isConnectWalletModalOpen.value = true
}
const closeConnectButtonModal = () => {
  isConnectWalletModalOpen.value = false
}

/**
 * switch network
 */
const { chain } = useNetwork()
const isCorrectChain = computed(() => chain?.value?.id === DEFAULT_CHAIN.id)

const { switchNetworkAsync } = useSwitchNetwork()

const switchNetwork = async () => {
  await switchNetworkAsync.value?.(DEFAULT_CHAIN.id)
  connect.value(metamask) // disconnect issue fix
}

/**
 * account
 */
const { address, isConnected } = useAccount()

/**
 * tokens
 */
const tokens = computed(() => TOKENS[chain?.value?.id ?? DEFAULT_CHAIN.id])
const selectedToken = ref<Token>(ETH)
const isEth = computed(() => !selectedToken.value.address)

const isTokenListShown = ref(false)

const selectToken = (token: Token) => {
  isTokenListShown.value = false
  selectedToken.value = token
}

/**
 * balance
 */
const { data: balance } = useBalance({
  addressOrName: address,
  token: computed(() => selectedToken.value.address),
  chainId: computed(() => (isCorrectChain.value ? chain?.value?.id : DEFAULT_CHAIN.id)),
  formatUnits: computed(() => selectedToken.value.decimals),
  watch: true,
})

/**
 * quantity
 */
const quantity = ref(1)

watch([selectedVariant], () => {
  quantity.value = 1
  isTokenListShown.value = false
})

/**
 * amount
 */
const amountUsd = computed(() => variantInfo.value.price * quantity.value)

const tokenMintRate = 1
const tokenAmount = computed(() => (variantInfo.value.price * quantity.value) / tokenMintRate)

/**
 * allowance
 */
const spender = computed(() => SAVE_PAKISTAN_CONTRACT_ADDRESS[chain?.value?.id ?? DEFAULT_CHAIN.id])

const isExceedsAllowance = ref(false)

const { data: allowance, refetch: refetchAllowance } = useAllowance({
  token: computed(() => selectedToken.value),
  owner: address,
  spender: spender,
  refetchInterval: computed(() => isExceedsAllowance.value && 3000),
})

watch([allowance, tokenAmount, isEth], () => {
  isExceedsAllowance.value = !isEth.value && tokenAmount.value > (allowance.value ?? 0)
})

/**
 * approve
 */
const {
  mutate: mutateApprove,
  data: approveTx,
  isLoading: isSigningApprove,
  reset: resetApproveTx,
} = useApprove()

const { isLoading: isLoadingApprove } = useWaitForTransaction({
  hash: approveTx.value?.hash,
  wait: approveTx.value?.wait,
  confirmations: 4,
  onSettled: () => {
    resetApproveTx()
  },
  onSuccess: () => {
    refetchAllowance()
  },
})

const approve = () =>
  mutateApprove({
    spender: spender.value,
    value: tokenAmount.value.toString(),
    token: selectedToken.value,
  })

const isApproving = computed(
  () => isSigningApprove.value || (isLoadingApprove.value && !!approveTx.value)
)

/**
 * mint
 */
const {
  mutate: mintWithEth,
  data: mintWithEthTx,
  isLoading: isSigningMintWithEth,
  reset: resetMintWithEthTx,
} = useMintWithEth()

const {
  mutate: mintWithToken,
  data: mintWithTokenTx,
  isLoading: isSigningMintWithToken,
  reset: resetMintWithTokenTx,
} = useMintWithToken()

const mint = () => {
  if (!selectedVariant.value) {
    return
  }
  if (!selectedToken.value.address) {
    mintWithEth({
      variant: selectedVariant.value,
      quantity: quantity.value,
    })
  } else {
    mintWithToken({
      variant: selectedVariant.value,
      quantity: quantity.value,
      token: selectedToken.value,
    })
  }
}

const mintTx = computed(() => mintWithEthTx.value || mintWithTokenTx.value)

const resetMintTx = () => {
  resetMintWithEthTx()
  resetMintWithTokenTx()
}

const { isLoading: isLoadingMint } = useWaitForTransaction({
  hash: mintTx.value?.hash,
  wait: mintTx.value?.wait,
  onSuccess: (receipt) => {
    console.log(receipt)
    refetchAllowance()
    store.setSelectedVariant(undefined)
  },
  onError: (error) => {
    console.error(error)
  },
})

const isMinting = computed(
  () =>
    isSigningMintWithEth.value ||
    isSigningMintWithToken.value ||
    (isLoadingMint.value && !!mintTx.value)
)

const isTxSubmittedModalOpen = computed(() => !!mintTx.value)
const onTxSubmittedModalClose = () => {
  resetMintTx()
}
</script>

<template>
  <div v-if="selectedVariant !== undefined" id="donate" class="flex-1">
    <div
      class="flex flex-col w-full h-full xl:overflow-auto bg-green-300 px-8 py-14 lg:px-10 lg:py-20 text-cyan-900 gap-14 lg:gap-20 items-center shadow-green-300 shadow-2xl"
    >
      <!-- Variant info -->
      <div class="flex flex-col gap-6 lg:w-4/5">
        <div class="flex gap-5 lg:gap-6">
          <img :src="variantInfo.imgSrc" class="h-24 lg:h-28" />
          <span class="text-2xl lg:text-3xl font-bold leading-7 lg:leading-8">{{
            variantInfo.title
          }}</span>
        </div>
        <div class="text-lg xl:text-xl leading-6">{{ variantInfo.desc }}</div>
        <div class="flex gap-2 items-center">
          <div class="px-3 py-1 bg-green-100 text-2xl rounded-md">${{ variantInfo.price }}</div>
          <div v-if="variantInfo.subdesc" class="text-sm lg:text-md leading-5">
            {{ variantInfo.subdesc }}
          </div>
        </div>
      </div>

      <div class="text-xl font-bold">Click Donate to Mint Your NFT</div>

      <!-- Quantity -->
      <div class="flex flex-row h-12 w-full rounded-lg relative bg-transparent mt-1 gap-5">
        <button
          class="bg-white h-full w-20 rounded-lg cursor-pointer outline-none"
          @click="quantity > 1 ? (quantity -= 1) : undefined"
        >
          <span class="m-auto text-3xl font-bold">−</span>
        </button>
        <input
          class="outline-none focus:outline-none text-center h-full w-full bg-transparent font-bold text-5xl md:text-basecursor-default items-center pointer-events-none"
          :value="quantity"
        />
        <button class="bg-white h-full w-20 rounded-lg cursor-pointer" @click="quantity += 1">
          <span class="m-auto text-3xl font-bold">+</span>
        </button>
      </div>

      <div class="flex flex-col gap-5 w-full">
        <!-- Connect wallet button -->
        <button
          v-if="!isConnected"
          class="font-bold text-3xl bg-white p-4 rounded-lg w-full hover:opacity-90"
          @click="showConnectButtonModal"
        >
          Connect Wallet
        </button>

        <!-- Switch network button -->
        <button
          v-else-if="!isCorrectChain"
          class="font-bold text-3xl bg-white p-4 rounded-lg w-full hover:opacity-90"
          @click="switchNetwork"
        >
          Switch Network
        </button>

        <div class="flex flex-col gap-2">
          <!-- Token list -->
          <div v-if="isConnected && isCorrectChain" class="relative inline-block w-full space-y-2">
            <div class="flex justify-between items-end gap-2">
              <button
                class="inline-flex w-30 justify-center rounded-md bg-green-50 px-4 py-2 text-md text-gray-700 shadow-sm hover:bg-green-100"
                @click="isTokenListShown = !isTokenListShown"
              >
                <div class="flex gap-2 items-center">
                  <img :src="selectedToken.logoURI" class="w-6" />
                  {{ selectedToken.symbol }}
                  <ChevronDownIcon />
                </div>
              </button>

              <div class="text-right leading-4 text-sm">
                Balance: {{ balance?.formatted.substring(0, 6) ?? '0.0' }}
                {{ selectedToken.symbol }}
              </div>
            </div>

            <div
              class="absolute -top-2 left-0 z-10 w-full rounded-xl bg-gray-50 shadow-lg cursor-pointer"
              :class="[!isTokenListShown && 'hidden']"
            >
              <div
                v-for="token in tokens"
                :key="token.symbol"
                class="text-gray-700 block px-4 py-2 text-md hover:bg-green-50 rounded-xl"
                @click="selectToken(token)"
              >
                <div class="flex gap-2 items-center">
                  <img :src="token.logoURI" class="w-6" />
                  {{ token.symbol }}
                </div>
              </div>
            </div>

            <!-- Approve button -->
            <button
              v-if="isExceedsAllowance"
              class="font-bold text-3xl bg-white p-4 rounded-lg w-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isApproving"
              @click="approve"
            >
              {{ isApproving ? 'Approving...' : `Approve ${selectedToken.symbol}` }}
            </button>
          </div>

          <!-- Mint button -->
          <button
            class="font-bold text-3xl bg-white p-4 rounded-lg w-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!isConnected || !isCorrectChain || isExceedsAllowance || isMinting"
            @click="mint"
          >
            {{ isMinting ? 'Minting...' : `Donate $${amountUsd}` }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ConnectWalletModal :is-open="isConnectWalletModalOpen" :on-close="closeConnectButtonModal" />
    <TxSubmittedModal
      :is-open="isTxSubmittedModalOpen"
      :on-close="onTxSubmittedModalClose"
      :tx="mintWithEthTx || mintWithTokenTx"
    />
  </div>
</template>
