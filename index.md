---
layout: home
---
<script setup>
import toc from './.vitepress/toc.json'
</script>

# Inhaltsverzeichnis

<ul>
  <li v-for="page in toc" :key="page">
    <a :href="`/${page.replace(/\.md$/, '')}`">{{ page.replace(/\.md$/, '') }}</a>
  </li>
</ul>
