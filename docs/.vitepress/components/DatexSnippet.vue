<template>
  <DatexPlayground :code="sanitizedCode" />
</template>

<script setup>
import { computed, useSlots } from 'vue'
import DatexPlayground from './DatexPlayground.vue'

const slots = useSlots()

const sanitizedCode = computed(() => {
  const raw = slots.default?.()[0]?.children || ''
  return String(raw).trim()
})
</script>

