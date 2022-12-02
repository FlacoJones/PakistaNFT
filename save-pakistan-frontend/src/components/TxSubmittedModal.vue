<script setup lang="ts">
import { ContractTransaction } from 'ethers'
import { useNetwork } from 'vagmi'

import CloseIcon from '@/components/icons/CloseIcon.vue'
import TweeterIcon from '@/components/icons/TweeterIcon.vue'

defineProps<{
  isOpen: boolean
  onClose: () => void
  tx?: ContractTransaction | undefined
}>()

const { chain } = useNetwork()

const openseaUrl = `https://opensea.io/collection/save-pakistan`
const tweetText = `🇵🇰🙏 I've just minted Save Pakistan NFT: ${openseaUrl}`
</script>

<template>
  <div
    tabindex="-1"
    class="flex overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full justify-center items-center bg-emerald-300/30 backdrop-blur-sm"
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
            Transaction submitted
          </h3>
        </div>
        <!-- Modal body -->
        <div class="p-6">
          <!-- <p class="text-sm font-normal text-gray-500 dark:text-gray-400">Thank you text</p> -->
          <ul class="space-y-3">
            <li>
              <a
                class="flex items-center p-3 text-base text-center cursor-pointer font-bold text-gray-900 bg-gray-50 rounded-lg hover:bg-gray-100 group hover:shadow dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
                :href="`${chain?.blockExplorers?.default.url}/tx/${tx?.hash}`"
                target="_blank"
              >
                <span class="flex-1 ml-3 whitespace-nowrap">View on explorer</span>
              </a>
            </li>
            <li>
              <a
                class="flex items-center p-3 text-base text-center cursor-pointer font-bold text-gray-900 bg-gray-50 rounded-lg hover:bg-gray-100 group hover:shadow dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
                :href="openseaUrl"
                target="_blank"
              >
                <span class="flex-1 ml-3 whitespace-nowrap">Collection on OpenSea</span>
              </a>
            </li>
            <li>
              <a
                class="flex items-center p-3 text-base text-center cursor-pointer font-bold text-gray-900 bg-gray-50 rounded-lg hover:bg-gray-100 group hover:shadow dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
                :href="`https://twitter.com/intent/tweet?text=${tweetText}`"
                target="_blank"
              >
                <div class="inline-flex items-center mx-auto">
                  <TweeterIcon />
                  <span class="flex-1 ml-3 whitespace-nowrap">Tweet it!</span>
                </div>
              </a>
            </li>
            <li>
              <a
                class="flex items-center p-3 text-base text-center cursor-pointer font-bold text-gray-900 bg-gray-50 rounded-lg hover:bg-gray-100 group hover:shadow dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
                @click="onClose"
              >
                <span class="flex-1 ml-3 whitespace-nowrap">Done</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
