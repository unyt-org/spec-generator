// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import 'virtual:group-icons.css' 
import './style.css'
import TypeScriptPlayground from '../components/TypeScriptPlayground.vue'
import DatexPlayground from '../components/DatexPlayground.vue'
import DatexSnippet from '../components/DatexSnippet.vue'
import 'viewerjs/dist/viewer.min.css'
import imageViewer from 'vitepress-plugin-image-viewer'
import vImageViewer from 'vitepress-plugin-image-viewer/lib/vImageViewer.vue'
import { useRoute, useData } from 'vitepress'
import codeblocksFold from 'vitepress-plugin-codeblocks-fold'
import 'vitepress-plugin-codeblocks-fold/style/index.css'
import "vitepress-markdown-timeline/dist/theme/index.css";

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('New content available, reloading...');
    window.location.reload();
  });
}

if (typeof window !== 'undefined') {
  import('https://esm.sh/@unyt/datex@0.0.4')
    .then(module => {
      Object.assign(window, module)
      console.log('DATEX loaded globally')
    })
    .catch(error => {
      console.error('Failed to load DATEX:', error)
    })
}

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
    app.component('DatexPlayground', DatexPlayground)
    app.component('DatexSnippet', DatexSnippet)
  },
  setup() {
    const route = useRoute()
    const { frontmatter } = useData()

    imageViewer(route)
    codeblocksFold({ route, frontmatter })
  }
} satisfies Theme