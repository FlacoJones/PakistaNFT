import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useStore = defineStore('exampleStore', () => {
  const wagmi = ref(true)

  return { wagmi }
})
