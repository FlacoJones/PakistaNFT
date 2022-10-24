<script setup lang="ts">
import { SPVariant } from '@/types'
import { SP_VARIANT_INFO } from '@/constants'
import { computed } from 'vue'

const props = defineProps<{
  variant: SPVariant
}>()

const info = computed(() => SP_VARIANT_INFO[props.variant])
</script>

<template>
  <div class="flex flex-1 flex-col p-6 gap-3 hover:bg-green-50 cursor-pointer rounded-md">
    <div class="flex gap-4">
      <img
        src="https://uxwing.com/wp-content/themes/uxwing/download/household-and-furniture/food-bag-icon.png"
        class="h-20"
      />
      <span class="text-xl font-bold leading-6">{{ info.title }}</span>
    </div>
    <div>{{ info.desc }}</div>
    <div class="flex gap-2 items-center">
      <div class="px-2 bg-green-400 font-bold text-lg text-white rounded-sm">${{ info.price }}</div>
      <div v-if="info.subdesc" class="text-xs">{{ info.subdesc }}</div>
    </div>
  </div>
</template>
