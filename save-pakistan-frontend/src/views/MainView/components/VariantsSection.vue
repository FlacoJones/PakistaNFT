<script setup lang="ts">
import { SPVariant } from '@/types'
import VariantsSectionItem from './VariantsSectionItem.vue'

defineProps<{ onVariantSelect: (variant: SPVariant) => void }>()
</script>

<template>
  <div
    class="flex flex-col w-full min-h-fit px-2 py-8 md:p-6 xl:p-10 text-cyan-900 xl:overflow-hidden"
  >
    <p class="text-2xl font-bold px-4 py-6 xl:p-6">Choose an option:</p>
    <a href="#donate">
      <div class="flex md:flex-wrap">
        <VariantsSectionItem
          :variant="SPVariant.RationBag"
          @click="onVariantSelect(SPVariant.RationBag)"
        />
        <VariantsSectionItem
          :variant="SPVariant.PortableToilets"
          @click="onVariantSelect(SPVariant.PortableToilets)"
        />
      </div>

      <div class="flex md: flex-wrap">
        <VariantsSectionItem
          :variant="SPVariant.HygieneKit"
          @click="onVariantSelect(SPVariant.HygieneKit)"
        />
        <VariantsSectionItem :variant="SPVariant.Water" @click="onVariantSelect(SPVariant.Water)" />
      </div>

      <div class="flex md: flex-wrap">
        <VariantsSectionItem
          :variant="SPVariant.TemporaryShelter"
          @click="onVariantSelect(SPVariant.TemporaryShelter)"
        />
        <VariantsSectionItem
          :variant="SPVariant.WaterWheel"
          @click="onVariantSelect(SPVariant.WaterWheel)"
        />
      </div>
    </a>
  </div>
</template>
