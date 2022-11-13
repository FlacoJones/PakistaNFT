<script setup lang="ts">
import { watch } from 'vue'
import { useConnect } from 'vagmi'

import CloseIcon from '@/components/icons/CloseIcon.vue'
import MetamaskIcon from '@/components/icons/MetamaskIcon.vue'
import BraveIcon from '@/components/icons/BraveIcon.vue'
import WalletConnectIcon from '@/components/icons/WalletConnectIcon.vue'
import CoinbaseWalletIcon from '@/components/icons/CoinbaseWalletIcon.vue'

/**
 * props
 */
const props = defineProps<{
  isOpen: boolean
  onClose: () => void
}>()

/**
 * vagmi
 */
const { connect, connectors, isConnected } = useConnect()

/**
 * connectors
 */
const metamask = connectors.value[0]
const brave = connectors.value[1]
const walletConnect = connectors.value[2]
const coinbaseWallet = connectors.value[3]

/**
 * handlers
 */
const connectMetamask = () => connect.value(metamask)
const connectBrave = () => connect.value(brave)
const connectWalletConnect = () => connect.value(walletConnect)
const connectCoinbaseWallet = () => connect.value(coinbaseWallet)

/**
 * close on connect
 */
watch([isConnected], () => {
  if (isConnected) {
    props.onClose()
  }
})
</script>

<template>
  <div
    tabindex="-1"
    class="flex overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full justify-center items-center bg-cyan-700/60 backdrop-blur-sm"
    :class="!isOpen && 'hidden'"
  >
    <div class="relative p-4 w-screen max-w-md h-screen md:h-auto">
      <!-- Modal content -->
      <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
        <button
          type="button"
          class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
          @click="onClose"
        >
          <CloseIcon />
          <span class="sr-only">Close modal</span>
        </button>
        <!-- Modal header -->
        <div class="py-4 px-6 rounded-t border-b dark:border-gray-600">
          <h3 class="text-base font-semibold text-gray-900 lg:text-xl dark:text-white">
            Connect wallet
          </h3>
        </div>
        <!-- Modal body -->
        <div class="p-6">
          <p class="text-sm font-normal text-gray-500 dark:text-gray-400">
            Connect with one of our available wallet providers.
          </p>
          <ul class="my-4 space-y-3">
            <li>
              <a
                class="flex items-center p-3 text-base cursor-pointer font-bold text-gray-900 bg-gray-50 rounded-lg hover:bg-gray-100 group hover:shadow dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
                @click="connectMetamask"
              >
                <MetamaskIcon />
                <span class="flex-1 ml-3 whitespace-nowrap">Metamask</span>
                <span
                  class="inline-flex items-center justify-center px-2 py-0.5 ml-3 text-xs font-medium text-gray-500 bg-gray-200 rounded dark:bg-gray-700 dark:text-gray-400"
                  >Popular</span
                >
              </a>
            </li>
            <li>
              <a
                class="flex items-center p-3 text-base cursor-pointer font-bold text-gray-900 bg-gray-50 rounded-lg hover:bg-gray-100 group hover:shadow dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
                @click="connectBrave"
              >
                <BraveIcon />
                <span class="flex-1 ml-3 whitespace-nowrap">Brave</span>
              </a>
            </li>
            <li>
              <a
                class="flex items-center p-3 text-base cursor-pointer font-bold text-gray-900 bg-gray-50 rounded-lg hover:bg-gray-100 group hover:shadow dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
                @click="connectWalletConnect"
              >
                <WalletConnectIcon />
                <span class="flex-1 ml-3 whitespace-nowrap">Wallet Connect</span>
              </a>
            </li>
            <li>
              <a
                class="flex items-center p-3 text-base cursor-pointer font-bold text-gray-900 bg-gray-50 rounded-lg hover:bg-gray-100 group hover:shadow dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
                @click="connectCoinbaseWallet"
              >
                <CoinbaseWalletIcon />
                <span class="flex-1 ml-3 whitespace-nowrap">Coinbase Wallet</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
