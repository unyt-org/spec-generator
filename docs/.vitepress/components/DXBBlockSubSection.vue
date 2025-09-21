<template>
    <details class="container" open>
        <summary>
            <h3>{{ title }}</h3>
        </summary>
        <div ref="gridRef" :style="{ display: 'grid', gridTemplateColumns: `repeat(${COL_WIDTH}, minmax(0, 1fr))` }">
            <template
                v-for="(part, i) in createByteParts(sectionDefinition, data)"
                :key="i">
                <a :href="`#${normalizeName(sectionDefinition.name)}-${normalizeName(part.name)}`" style="display: contents;color:inherit">
                    <div class="part" :style="{
                            gridColumn: `${part.normalizedColOffset + 1} / span ${part.normalizedByteLength}`,
                            gridRow: `${part.row + 1} / span 1`
                        }"
                        :class="{
                            'right-opened': part.rightOpened,
                            'left-opened': part.leftOpened,
                        }">
                        <div class="part-inner optional-bg" :style="{
                            backgroundColor: part.category,
                        }">
                            <div v-if="part.optional" class="optional-bg-overlay"></div>
                            <div :style="{
                                zIndex: 1,
                                position: 'relative',
                                visibility: (part.first || !part.bytes) ? 'visible' : 'hidden', 
                                whiteSpace: 'nowrap',
                                ...!part.first && !part.bytes && { 
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100%'
                                },
                                ...!part.first && part.bytes && { display: 'none' }
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
                    </a>
            </template>
        </div>
    </details>
</template>

<script setup lang="ts">
import type { FieldDefinition, ParsedField, ParsedSection, ParsedStructure, SectionDefinition } from "@unyt/speck";
import { ref, defineProps, onMounted, onUnmounted, nextTick, h } from "vue";

defineProps<{
    title: string;
    sectionDefinition: SectionDefinition,
    data?: ParsedSection,
}>();

// TODO
const Colors = [
    '#e64b6b', // red
    '#29b570', // green
    '#1a87ad', // blue,
    '#dfa72e', // yellow
    '#893fd0', // purple
    '#6B7280', // gray
    '#2e37df', // dark blue
]

const Category: Record<string, string> = {
    'red': Colors[0],
    'green': Colors[1],
    'blue': Colors[2],
    'yellow': Colors[3],
    'purple': Colors[4],
    'gray': Colors[5],
    'dark blue': Colors[6],
}

const COL_WIDTH = 200;
const bytesPerRow = ref(42);
const gridRef = ref<HTMLElement | null>(null);


function bytesToHexString(bytes: Uint8Array) {
    return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join(" ").toUpperCase();
}

function createByteParts(
    sectionDefinition: SectionDefinition,
    data?: ParsedSection,
) {
    let byteOffset = 0;
    let lastColOffset = 0;
    let lastRow = 0;

    // remove all byte sections that have no data in data
    const fieldDefinitions = !data ? sectionDefinition.fields : sectionDefinition.fields.filter(def => {
        const partData = data?.fields.find(d => d.name === def.name);
        return partData;
    });

    return fieldDefinitions.map(definition => {
        const partData = data?.fields?.find(d => d.name === definition.name);
        const {parts, byteOffset: byteOffsetNew, lastColOffset: lastColOffsetNew, lastRow: lastRowNew} = createField(
            byteOffset, 
            definition, 
            partData, 
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

function createField(
    byteOffset: number,
    definition: FieldDefinition,
    parsedField: ParsedField | null = null,
    bytesPerRow: number,
    lastColOffset: number,
    lastRow: number
) {
    if (parsedField && parsedField.bytes.length !== definition.byteSize) {
        throw new Error(
            `Byte length mismatch for ${definition.name}: expected ${definition.byteSize}, got ${parsedField.bytes.length}`
        );
    }

    const parts: any[] = [];
    let bytesRemaining = definition.byteSize;
    const minByteWidth = 6;

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
        const bytesInRow = parsedField?.bytes?.slice(0, actualBytesInRow);

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
            optional: definition.if ?? false,
            category: definition.category ? Category[definition.category]: undefined,
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
        bytesPerRow.value = nearestDivisor(Math.floor(gridWidth / 24));
    }
};

function normalizeName(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
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
    position: relative;
    overflow: hidden;
}
.part {
    padding: 0.25rem;
}

.part:hover {
    transform: scale(1.02);
}

.blurred .part-inner {
    background-color: var(--vp-c-divider)!important;
}

.right-opened .part-inner {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}
.left-opened .part-inner {
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

.optional-bg-overlay {
    position: absolute;
    z-index: 0;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    /* Background with diagonal stripes */
    background: repeating-linear-gradient(
        45deg,           /* angle of the stripes */
        #ffffff00,         /* stripe color */
        #ffffff00 10px,    /* stripe width */
        #ffffff15 10px,    /* gap color */
        #ffffff15 20px     /* gap width */
    );
}


</style>