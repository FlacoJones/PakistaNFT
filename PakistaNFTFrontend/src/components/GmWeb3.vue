<script setup lang="ts">
import { useEthMint } from '@/composables/useMint'
import { useAccount } from 'vagmi'
import { NFTVariant } from '@/types'

import ConnectWalletModal from './ConnectWalletModal.vue'
import ConnectWalletButton from './ConnectWalletButton.vue'

import { ref } from 'vue'

/**
 * vagmi
 */
const { address: account } = useAccount()
const { mutate: ethMint } = useEthMint()

/**
 * connect wallet
 */
const isConnectWalletModalOpen = ref(false)
const showConnectButtonModal = () => {
  isConnectWalletModalOpen.value = true
}
const closeConnectButtonModal = () => {
  isConnectWalletModalOpen.value = false
}

/**
 * mint tests
 */
const handleMintButtonClick = () => {
  ethMint({ nftVariant: NFTVariant.MEAL, amount: 2 })
}
</script>

<template>
  <!-- test vagmi account -->
  <p>gm {{ account ?? 'web3' }}</p>

  <!-- connect wallet -->
  <ConnectWalletButton @click="showConnectButtonModal" />
  <ConnectWalletModal :is-open="isConnectWalletModalOpen" :on-close="closeConnectButtonModal" />

  <!-- test mint button -->
  <button class="bg-pink-300 py-2 px-6" @click="handleMintButtonClick">mint</button>
</template>
