<script setup lang="ts">
import { useMintWithEth } from '@/composables'
import { useAccount } from 'vagmi'
import { SPVariant } from '@/types'

import ConnectWalletModal from './ConnectWalletModal.vue'
import ConnectWalletButton from './ConnectWalletButton.vue'

import { ref } from 'vue'

/**
 * vagmi
 */
const { address: account } = useAccount()
const { mutate: mintWithEth } = useMintWithEth()

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
  mintWithEth({ variant: SPVariant.RationBag, quantity: 2 })
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
