<script setup lang="ts">
import { useAccount, useConnect } from 'vagmi'

const { connect, connectors } = useConnect()
const { address } = useAccount()
</script>

<template>
  <p>gm {{ address ?? 'web3' }}</p>
  <button class="bg-sky-300 p-2" @click="connect(connectors[0])">connect wallet</button>
</template>
