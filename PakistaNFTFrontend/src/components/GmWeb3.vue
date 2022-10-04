<script setup lang="ts">
import { useMint } from '@/composables/useMint'
import { useAccount, useConnect } from 'vagmi'

const { connect, connectors } = useConnect()
const { address: account } = useAccount()
const { mutate: mint } = useMint()

const handleMintButtonClick = () => {
  mint({ account: account.value, tokenType: 1, amount: 1 })
}
</script>

<template>
  <p>gm {{ account ?? 'web3' }}</p>
  <button class="bg-sky-300 p-2" @click="connect(connectors[0])">connect wallet</button>
  <button class="bg-pink-300 py-2 px-6" @click="handleMintButtonClick()">mint</button>
</template>
