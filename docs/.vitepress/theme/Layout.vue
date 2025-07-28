<script setup>
import DefaultTheme from 'vitepress/theme'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #doc-before>
      <div class="warning custom-block" style="margin-bottom: 40px;">
		<p>
		  <strong>Important Notice:</strong>
		</p>
		<p>
		  This is a Working Draft of the DATEX Specification. This is document is work in progress and may change at any time.
		  It is not intended to be used for production purposes.
		</p>
	  </div>
    </template>
  </Layout>
</template>