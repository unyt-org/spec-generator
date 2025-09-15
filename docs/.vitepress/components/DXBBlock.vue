<script setup lang="ts">
import DXBBlockSubSection from "./DXBBlockSubsection.vue";

const Category = {
  red: "bg-rose-800",
  green: "bg-emerald-800",
  blue: "bg-blue-800",
  yellow: "bg-yellow-800",
  purple: "bg-purple-800",
  gray: "bg-gray-800",
  orange: "bg-orange-800",
};
type Category = keyof typeof Category;

type ByteSection = {
  name: string;
  category: Category;
  byteSize: number;
  optional?: boolean;
};

const routingHeader: ByteSection[] = [
  { name: "version", category: "blue", byteSize: 1 },
  { name: "distance", category: "red", byteSize: 1 },
  { name: "ttl", category: "green", byteSize: 1 },
  { name: "flags", category: "yellow", byteSize: 1 },
  { name: "size_small", category: "yellow", byteSize: 2, optional: true },
  { name: "size_large", category: "yellow", byteSize: 4, optional: true },
  { name: "sender_type", category: "purple", byteSize: 1 },
  { name: "sender_id", category: "purple", byteSize: 18 },
  { name: "sender_inst", category: "purple", byteSize: 2 },
];

const blockHeader: ByteSection[] = [];
const encryptedHeader: ByteSection[] = [];
const body: ByteSection[] = [];
</script>

<template>
  <div class="bg-gray-950 flex flex-col justify-center items-center text-white gap-4">
    <DXBBlockSubSection title="Routing Header" :byte-definitions="routingHeader" />
    <DXBBlockSubSection title="Block Header" :byte-definitions="blockHeader" />
    <DXBBlockSubSection title="Encrypted Header" :byte-definitions="encryptedHeader" />
    <DXBBlockSubSection title="Body" :byte-definitions="body" />
  </div>
</template>
