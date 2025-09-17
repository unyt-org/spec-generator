<script setup lang="ts">
import DXBBlockSubSection from "./DXBBlockSubSection.vue";
import { routingHeader, blockHeader, encryptedHeader, body, generateExampleBlock, parseDXBBlock } from "./block-types.ts";

const block = generateExampleBlock({
	routingHeader: { 
		magic_number: [0x01, 0x64],
    version: [0x02],
    flags: [0x11111111]
	},
	blockHeader: {},
	encryptedHeader: {
    enc_flags: [0b1000]
  },
	body: {},
});

const parsedBlock = parseDXBBlock(block);
console.log("block",block)
console.log("parsedBlock", parsedBlock)

</script>

<template>
  <div class="container">
    <DXBBlockSubSection title="Routing Header" :byte-definitions="routingHeader" :data="parsedBlock[0].parts" />
    <DXBBlockSubSection title="Block Header" :byte-definitions="blockHeader" :data="parsedBlock[1].parts" />
    <DXBBlockSubSection title="Encrypted Header" :byte-definitions="encryptedHeader" :data="parsedBlock[2].parts" />
    <DXBBlockSubSection title="Body" :byte-definitions="body" :data="parsedBlock[3].parts" />
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