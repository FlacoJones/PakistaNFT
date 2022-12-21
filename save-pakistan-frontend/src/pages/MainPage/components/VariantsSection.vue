<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { SPVariant } from '@/types'
import { useStore } from '@/store'
import VariantsSectionItem from './VariantsSectionItem.vue'

const store = useStore()
const { selectedVariant } = storeToRefs(store)
</script>

<template>
  <div
    class="flex flex-col w-full min-h-fit px-2 py-8 md:p-6 xl:p-10 text-cyan-900 xl:overflow-auto"
    :class="[selectedVariant !== undefined ? 'xl:w-2/5' : 'flex-1']"
  >
    <p class="text-2xl font-bold px-4 pb-6">Choose an option:</p>
    <a href="#donate">
      <div class="flex md:flex-wrap">
        <VariantsSectionItem :variant="SPVariant.RationBag" />
        <VariantsSectionItem :variant="SPVariant.PortableToilets" />
      </div>

      <div class="flex md: flex-wrap">
        <VariantsSectionItem :variant="SPVariant.HygieneKit" />
        <VariantsSectionItem :variant="SPVariant.Water" />
      </div>

      <div class="flex md: flex-wrap">
        <VariantsSectionItem :variant="SPVariant.TemporaryShelter" />
        <VariantsSectionItem :variant="SPVariant.H2OWheel" />
      </div>
    </a>
  </div>
</template>
