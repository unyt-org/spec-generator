// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './style.css'
import TypeScriptPlayground from '../components/TypeScriptPlayground.vue'
// import DatexPlayground from '../components/DatexPlayground.vue'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app, router, siteData }) {
    app.component('TypeScriptPlayground', TypeScriptPlayground)
    // app.component('DatexPlayground', DatexPlayground)
  }
} satisfies Theme
