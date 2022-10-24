<script setup lang="ts">
import { SPVariant } from '@/types'
import { computed, ref } from 'vue'
import { SP_VARIANT_INFO } from '@/constants'

const props = defineProps<{
  variant: SPVariant
  onMintButtonClick: () => void
}>()

const variantInfo = computed(() => SP_VARIANT_INFO[props.variant])
const quantity = ref(1)
</script>

<template>
  <div class="flex-1">
    <div
      class="flex flex-col w-full h-full bg-green-300 p-10 text-cyan-900 gap-20 items-center justify-center"
    >
      <div class="flex flex-col gap-6 w-4/5">
        <div class="flex gap-6">
          <img
            src="https://uxwing.com/wp-content/themes/uxwing/download/household-and-furniture/food-bag-icon.png"
            class="h-28"
          />
          <span class="text-4xl font-bold leading-9">{{ variantInfo.title }}</span>
        </div>
        <div class="text-xl leading-6">{{ variantInfo.desc }}</div>
        <div class="flex gap-2 items-center">
          <div class="px-2 bg-green-400 font-bold text-2xl text-white rounded-sm">
            ${{ variantInfo.price }}
          </div>
          <div v-if="variantInfo.subdesc" class="leading-5">{{ variantInfo.subdesc }}</div>
        </div>
      </div>

      <div class="text-xl font-bold">Click Donate to Mint Your NFT</div>

      <div class="flex flex-row h-11 w-full rounded-lg relative bg-transparent mt-1 gap-5">
        <button
          class="bg-white h-full w-20 rounded-lg cursor-pointer outline-none"
          @click="quantity > 1 ? (quantity -= 1) : undefined"
        >
          <span class="m-auto text-2xl font-bold">−</span>
        </button>
        <input
          class="outline-none focus:outline-none text-center w-full bg-transparent font-bold text-5xl md:text-basecursor-default items-center pointer-events-none"
          :value="quantity"
        />
        <button class="bg-white h-full w-20 rounded-lg cursor-pointer" @click="quantity += 1">
          <span class="m-auto text-2xl font-bold">+</span>
        </button>
      </div>

      <button class="font-bold text-4xl bg-white p-4 rounded-lg w-full" @click="onMintButtonClick">
        Donate
      </button>
    </div>
  </div>
</template>
