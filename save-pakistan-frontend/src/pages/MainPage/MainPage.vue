<script setup lang="ts">
import HeroSection from './components/HeroSection.vue'
import VariantsSection from './components/VariantsSection.vue'
import DonateSection from './components/DonateSection.vue'
</script>

<template>
  <div
    class="flex h-screen w-full xl:w-screen flex-col xl:flex-row gap-10 xl:gap-0 scroll-smooth font-clash"
  >
    <HeroSection />
    <VariantsSection />
    <DonateSection />
  </div>
</template>
