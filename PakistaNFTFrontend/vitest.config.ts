/// <reference types="vitest" />
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    preserveSymlinks: true,
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
