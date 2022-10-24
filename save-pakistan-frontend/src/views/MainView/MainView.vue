<script setup lang="ts">
import { ref } from 'vue'

import { SPVariant } from '@/types'

import HeroSection from './components/HeroSection.vue'
import VariantsSection from './components/VariantsSection.vue'
import DonateSection from './components/DonateSection.vue'

import ConnectWalletModal from '@/components/ConnectWalletModal.vue'
import ConnectWalletButton from '@/components/ConnectWalletButton.vue'

const selectedVariant = ref<SPVariant | null>(null)
const selectVariant = (variant: SPVariant) => {
  selectedVariant.value = variant
}
/** * vagmi */
// const { address: account } = useAccount()

/** * connect wallet */
const isConnectWalletModalOpen = ref(false)
const showConnectButtonModal = () => {
  isConnectWalletModalOpen.value = true
}
const closeConnectButtonModal = () => {
  isConnectWalletModalOpen.value = false
}
</script>

<template>
  <div class="flex h-screen w-screen">
    <!-- Hero section -->
    <HeroSection />

    <!-- Donation variants section -->
    <VariantsSection
      :class="[selectedVariant !== null ? 'w-2/5' : 'flex-1']"
      :on-variant-select="selectVariant"
    />

    <!-- Proceed donation section -->
    <DonateSection
      v-if="selectedVariant !== null"
      :variant="selectedVariant"
      :on-mint-button-click="showConnectButtonModal"
    />
  </div>

  <!-- connect wallet -->
  <ConnectWalletModal :is-open="isConnectWalletModalOpen" :on-close="closeConnectButtonModal" />
</template>
