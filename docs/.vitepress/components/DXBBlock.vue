<script setup lang="ts">
import DXBBlockSubSection from "./DXBBlockSubsection.vue";
import { routingHeader, blockHeader, encryptedHeader, body } from "./block-types.ts";
</script>

<template>
  <div class="container">
    <DXBBlockSubSection title="Routing Header" :byte-definitions="routingHeader" />
    <DXBBlockSubSection title="Block Header" :byte-definitions="blockHeader" />
    <DXBBlockSubSection title="Encrypted Header" :byte-definitions="encryptedHeader" />
    <DXBBlockSubSection title="Body" :byte-definitions="body" />
  </div>
</template>


<style scoped>
.container {
	display: flex;
	flex-direction: column;
	gap: 16px;
	padding: 16px;
}

</style>