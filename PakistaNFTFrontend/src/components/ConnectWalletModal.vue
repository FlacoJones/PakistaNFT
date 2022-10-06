<script setup lang="ts">
import { useConnect } from 'vagmi'
import MetamaskIcon from './icons/MetamaskIcon.vue'
import CloseIcon from './icons/CloseIcon.vue'
import WalletConnectIcon from './icons/WalletConnectIcon.vue'
import { watch } from 'vue'

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
const walletConnect = connectors.value[1]

/**
 * handlers
 */
const connectMetamask = () => connect.value(metamask)
const connectWalletConnect = () => connect.value(walletConnect)

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
    class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full justify-center items-center"
    :class="!isOpen && 'hidden'"
  >
    <div class="relative p-4 w-full max-w-md h-full md:h-auto">
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
                <span class="flex-1 ml-3 whitespace-nowrap">MetaMask</span>
                <span
                  class="inline-flex items-center justify-center px-2 py-0.5 ml-3 text-xs font-medium text-gray-500 bg-gray-200 rounded dark:bg-gray-700 dark:text-gray-400"
                  >Popular</span
                >
              </a>
            </li>
            <li>
              <a
                class="flex items-center p-3 text-base cursor-pointer font-bold text-gray-900 bg-gray-50 rounded-lg hover:bg-gray-100 group hover:shadow dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
                @click="connectWalletConnect"
              >
                <WalletConnectIcon />
                <span class="flex-1 ml-3 whitespace-nowrap">WalletConnect</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
