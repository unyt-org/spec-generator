<script setup lang="ts">
import { generateStructure, SectionDefinition } from "@unyt/speck";
import DXBBlockSubSection from "./DXBBlockSubSection.vue";
import { data } from "../json.data.ts";
const props = defineProps<{
  speck: string,
}>();
const speckPath = props.speck.startsWith(".") ? props.speck.slice(1) : props.speck;
const spec = data[speckPath];

const customData = {
  'Routing Header': {
    'Magic Number': [0x01, 0x64],
  }
}

const routingHeaderDefinition = spec.sections.find(s => s.name === "Routing Header") as SectionDefinition;
const blockHeaderDefinition = spec.sections.find(s => s.name === "Block Header") as SectionDefinition;
const encryptedHeaderDefinition = spec.sections.find(s => s.name === "Encrypted Header") as SectionDefinition;
const bodyDefinition = spec.sections.find(s => s.name === "Body") as SectionDefinition;

const block = generateStructure(spec as any, customData);
const routingHeader = block.find(b => b.name === "Routing Header")!;
const blockHeader = block.find(b => b.name === "Block Header")!;
const encryptedHeader = block.find(b => b.name === "Encrypted Header")!;
const body = block.find(b => b.name === "Body")!;
</script>

<template>
  <div class="container">
    <DXBBlockSubSection title="Routing Header" :section-definition="routingHeaderDefinition" :data="routingHeader" />
    <DXBBlockSubSection title="Block Header" :section-definition="blockHeaderDefinition" :data="blockHeader" />
    <DXBBlockSubSection title="Encrypted Header" :section-definition="encryptedHeaderDefinition" :data="encryptedHeader" />
    <DXBBlockSubSection title="Body" :section-definition="bodyDefinition" :data="body" />
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