
<template>
  <div class="bg-gray-900 p-4 rounded-sm w-[1200px] max-w-full">
    <h1 class="font-bold mb-2">{{ title }}</h1>
    <div
      ref="gridRef"
      class="grid"
      :style="{ gridTemplateColumns: `repeat(${COL_WIDTH}, minmax(0, 1fr))` }"
    >
      <template v-for="(def, index) in byteDefinitions" :key="index">
        <template v-for="(part, i) in createByteParts(0, def, data?.find(d => d.field === def.name)?.bytes, bytesPerRow, 0, 0).parts" :key="i">
          <div
            class="m-1 p-2 rounded-sm"
            :class="part.category"
            :style="{
              gridColumn: `${part.normalizedColOffset + 1} / span ${part.normalizedByteLength}`,
              gridRow: `${part.row + 1} / span 1`
            }"
          >
            <div class="whitespace-nowrap" :style="{ visibility: part.first ? 'visible' : 'hidden' }">
              <b>{{ part.name }}</b>
              <div class="text-white/60">
                {{ part.byteSize ? `${part.byteSize} byte${part.byteSize > 1 ? 's' : ''}` : '' }}
              </div>
            </div>
            <div class="whitespace-nowrap">
              {{ bytesToHexString(part.bytes) }}
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, onMounted, onUnmounted, nextTick } from "vue";
import type { ByteSection } from "./block-types.ts";

defineProps<{
  title: string;
  byteDefinitions: ByteSection[];
  data?: { field: string; bytes: number[] }[];
}>();

const COL_WIDTH = 1000;
const bytesPerRow = ref(42);
const gridRef = ref<HTMLElement | null>(null);

const Category = {
  red: "bg-rose-800",
  green: "bg-emerald-800",
  blue: "bg-blue-800",
  yellow: "bg-yellow-800",
  purple: "bg-purple-800",
  gray: "bg-gray-800",
  orange: "bg-orange-800",
};

function bytesToHexString(bytes: number[]) {
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join(" ").toUpperCase();
}

function createByteParts(
  byteOffset: number,
  definition: ByteSection,
  bytes: number[] | null = null,
  bytesPerRow: number,
  lastColOffset: number,
  lastRow: number
) {
  if (bytes && bytes.length !== definition.byteSize) {
    throw new Error(
      `Byte length mismatch for ${definition.name}: expected ${definition.byteSize}, got ${bytes.length}`
    );
  }

  const parts: any[] = [];
  let bytesRemaining = definition.byteSize;
  const minByteWidth = 5;

  while (bytesRemaining > 0) {
    const colOffset = byteOffset % bytesPerRow;
    const row = Math.floor(byteOffset / bytesPerRow);
    if (row !== lastRow) {
      lastRow = row;
      lastColOffset = 0;
    }
    const remainingInRow = bytesPerRow - colOffset;
    const actualBytesInRow = Math.min(remainingInRow, bytesRemaining ?? 0);
    let byteLengthInRow = Math.max(minByteWidth, actualBytesInRow);
    const bytesInRow =
      bytes?.slice(0, actualBytesInRow) ??
      new Array(actualBytesInRow).fill(0);

    const newRemainingInRow = bytesPerRow - (colOffset + byteLengthInRow);
    if (newRemainingInRow < minByteWidth && newRemainingInRow > 0) {
      byteLengthInRow += newRemainingInRow;
    }

    bytesRemaining -= byteLengthInRow;
    byteOffset += byteLengthInRow;

    const normalizedByteLength = byteLengthInRow * (COL_WIDTH / bytesPerRow);
    const normalizedColOffset = colOffset * (COL_WIDTH / bytesPerRow);
    lastColOffset = normalizedColOffset + normalizedByteLength;

    parts.push({
      name: definition.name,
      category: Category[definition.category],
      byteSize: definition.byteSize,
      bytes: bytesInRow,
      row,
      normalizedByteLength,
      normalizedColOffset,
      first: parts.length === 0,
    });
  }

  return {
    parts,
    byteOffset,
    lastColOffset,
    lastRow,
  };
}

function nearestDivisor(x: number) {
  for (let i = x; i > 0; i--) {
    if (COL_WIDTH % i === 0) return i;
  }
  return 1;
}

const render = () => {
  if (!gridRef.value) return;
  const gridWidth = gridRef.value.getBoundingClientRect().width;
  if (gridWidth) {
    bytesPerRow.value = nearestDivisor(Math.floor(gridWidth / 24));
  }
};

onMounted(() => {
  nextTick(render);
  window.addEventListener("resize", render);
  setTimeout(render, 100);
  setTimeout(render, 1000);
});

onUnmounted(() => {
  window.removeEventListener("resize", render);
});
</script>
