<template>
	<Suspense>
		<DXBBlock :speck="speck"></DXBBlock>
	</Suspense>
</template>

<script setup lang="ts">
import DXBBlock from './DXBBlock.vue';

const props = defineProps<{
  speck: string,
}>();
console.log(props.speck);
</script>