// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './style.css'
import TypeScriptPlayground from '../components/TypeScriptPlayground.vue'
// import DatexPlayground from '../components/DatexPlayground.vue'
import 'viewerjs/dist/viewer.min.css'
import imageViewer from 'vitepress-plugin-image-viewer'
import vImageViewer from 'vitepress-plugin-image-viewer/lib/vImageViewer.vue'
import { useRoute } from 'vitepress'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app }) {
    app.component('TypeScriptPlayground', TypeScriptPlayground)
    app.component('vImageViewer', vImageViewer)
    // app.component('DatexPlayground', DatexPlayground)
  },
  setup() {
    const route = useRoute()
    imageViewer(route)
  }
} satisfies Theme
