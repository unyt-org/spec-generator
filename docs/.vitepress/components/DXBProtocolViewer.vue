<template>
	<DXBBlock :speck="speck"></DXBBlock>
</template>

<script setup lang="ts">
import DXBBlock from './DXBBlock.vue';

const props = defineProps<{
  speck: string,
}>();
</script>