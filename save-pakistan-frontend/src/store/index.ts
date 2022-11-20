import { ref } from 'vue'
import { defineStore } from 'pinia'
import { SPVariant } from '@/types'

export const useStore = defineStore('MainStore', () => {
  const selectedVariant = ref<SPVariant | undefined>()
  const setSelectedVariant = (variant: SPVariant | undefined) => {
    selectedVariant.value = variant
  }

  return { selectedVariant, setSelectedVariant }
})
