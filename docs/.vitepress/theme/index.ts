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
if (typeof window !== 'undefined') {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered:', registration)
          
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New content available, reloading...')
                  setTimeout(() => {
                    window.location.reload()
                  }, 1000)
                }
              })
            }
          })
          setInterval(() => {
            registration.update()
          }, 60000)
          
        })
        .catch(error => {
          console.error('SW registration failed:', error)
        })
    })
  }
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