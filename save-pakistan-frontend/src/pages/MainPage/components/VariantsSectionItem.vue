<script setup lang="ts">
import { SPVariant } from '@/types'
import { SP_VARIANT_INFO } from '@/constants'
import { computed } from 'vue'
import { useStore } from '@/store'

const props = defineProps<{
  variant: SPVariant
}>()

const info = computed(() => SP_VARIANT_INFO[props.variant])

const { setSelectedVariant } = useStore()
</script>

<template>
  <div
    class="flex flex-1 flex-col px-4 py-6 xl:p-6 gap-3 hover:bg-green-50 cursor-pointer rounded-xl"
    @click="setSelectedVariant(info.variant)"
  >
    <div class="flex gap-3 xl:gap-4">
      <img :src="info.imageURI" class="h-16 xl:h-20" />
      <span class="text-lg xl:text-xl font-bold leading-5 xl:leading-6">{{ info.title }}</span>
    </div>
    <div class="text-sm xl:text-md leading-4 xl:leading-5">{{ info.desc }}</div>
    <div class="flex gap-2 items-center">
      <div class="px-2 bg-green-400 text-lg text-white rounded-sm">${{ info.price }}</div>
      <div v-if="info.subdesc" class="text-xs">{{ info.subdesc }}</div>
    </div>
  </div>
</template>
