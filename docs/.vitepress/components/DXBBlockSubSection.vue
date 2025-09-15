<template>
    <details class="container" open>
        <summary>
            <h3>{{ title }}</h3>
        </summary>
        <div ref="gridRef" :style="{ display: 'grid', gridTemplateColumns: `repeat(${COL_WIDTH}, minmax(0, 1fr))` }">
            <template
                v-for="(part, i) in createByteParts(byteDefinitions, data ? data.map(d => ({ field: d.field, bytes: d.bytes })) : [])"
                :key="i">
                <div class="part" :style="{
                        gridColumn: `${part.normalizedColOffset + 1} / span ${part.normalizedByteLength}`,
                        gridRow: `${part.row + 1} / span 1`
                    }"
                    :class="{
                        'right-opened': part.rightOpened,
                        'left-opened': part.leftOpened,
                        ['grouped-' + part.group]: true,
                    }"
                    @mouseenter="focusGroup(part.group)" @mouseleave="focusGroup(null)">
                    <div class="part-inner" :style="{
                        backgroundColor: part.category,
                    }">
                        <div :style="{ 
                            visibility: (part.first || !part.bytes) ? 'visible' : 'hidden', 
                            whiteSpace: 'nowrap',
                            ...!part.first && { 
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100%'
                            }
                            }">
                            <b style="font-weight: bolder;">{{ part.first ? part.name : '...' }}</b>
                            <div class="metadata" v-if="part.first">
                                {{ part.byteSize ? `${part.byteSize} byte${part.byteSize > 1 ? 's' : ''}` : '' }}
                            </div>
                        </div>
                        <div v-if="part.bytes" :style="{ whiteSpace: 'nowrap' }">
                            {{ bytesToHexString(part.bytes) }}
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </details>
</template>

<script setup lang="ts">
import { ref, defineProps, onMounted, onUnmounted, nextTick, h } from "vue";
import { Category, type BlockData, type ByteSection } from "./block-types.ts";

defineProps<{
    title: string;
    byteDefinitions: ByteSection[];
    data?: { field: string; bytes: number[] }[];
}>();

const COL_WIDTH = 1000;
const bytesPerRow = ref(42);
const gridRef = ref<HTMLElement | null>(null);



function bytesToHexString(bytes: number[]) {
    return bytes.map((b) => b.toString(16).padStart(2, "0")).join(" ").toUpperCase();
}

function createByteParts(
    byteDefinitions: ByteSection[],
    data: BlockData[number]["parts"],
) {
    let byteOffset = 0;
    let lastColOffset = 0;
    let lastRow = 0;
    return byteDefinitions.map(def => {
        const partData = data?.find(d => d.field === def.name);
        const {parts, byteOffset: byteOffsetNew, lastColOffset: lastColOffsetNew, lastRow: lastRowNew} = createBytePart(
            byteOffset, 
            def, 
            partData?.bytes, 
            bytesPerRow.value, 
            lastColOffset, 
            lastRow
        );
        byteOffset = byteOffsetNew;
        lastColOffset = lastColOffsetNew;
        lastRow = lastRowNew;
        return parts;
    }).flat()
}

function createBytePart(
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
        const bytesInRow = bytes?.slice(0, actualBytesInRow);

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
            group: definition.group ?? definition.name,
            category: Category[definition.category],
            byteSize: definition.byteSize,
            bytes: bytesInRow,
            row,
            normalizedByteLength,
            normalizedColOffset,
            first: parts.length === 0,
            leftOpened: parts.length > 0,
            rightOpened: bytesRemaining > 0,
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
        bytesPerRow.value = nearestDivisor(Math.floor(gridWidth / 30));
    }
};


function focusGroup(group: string | null) {
    const elements = gridRef.value?.getElementsByClassName("part");
    if (!elements) return;
    for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        if (group && el.classList.contains("grouped-" + group)) {
            el.classList.remove("blurred");
        } else if (group) {
            el.classList.add("blurred");
        } else {
            el.classList.remove("blurred");
        }
    }
}

onMounted(() => {
    nextTick(render);
    window.addEventListener("resize", render);
});

onUnmounted(() => {
    window.removeEventListener("resize", render);
});

</script>

<style scoped>
.container {
    background-color: var(--vp-code-block-bg);
    padding: 1rem;
    border-radius: 0.3rem;
    width: 100%;
    max-width: 1200px;
    box-sizing: border-box;
}

.part-inner {
    padding: 0.5rem;
    border-radius: 0.25rem;
    height: 100%;
}
.part {
    padding: 0.25rem;
}

.blurred .part-inner {
    background-color: var(--vp-c-divider)!important;
}

.part.right-opened {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}
.part.left-opened {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}

h3 {
    margin: 0;
    display: inline-block;
}

summary {
    cursor: pointer;
    outline: none;
    margin: 0;
}

.metadata {
    font-size: 0.95rem;
}


</style>