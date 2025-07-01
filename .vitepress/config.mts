import { defineConfig } from 'vitepress'
import fs from 'node:fs'
import path from 'node:path'

let sidebar

try {
  const jsonPath = path.resolve(__dirname, 'sidebar.json')
  const jsonRaw = fs.readFileSync(jsonPath, 'utf-8')
  sidebar = JSON.parse(jsonRaw)
} catch (e) {
  console.warn('⚠️ sidebar.json not found, falling back to default sidebar')
  sidebar = [
    {
      text: 'Home',
      link: '/',
    },
  ]
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "DATEX Spec",
  head: [
    ['script', { src: 'https://unpkg.com/typescript@latest/lib/typescript.js' }],
    ['script', { src: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs/loader.min.js' }],
    [
      'link',
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: 'https://dev.cdn.unyt.org/unyt_core/assets/skeleton_light.svg'
      }
    ]
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: 'https://cdn.unyt.org/unyt-resources/logos/unyt/text-light-transparent-3.svg',
    search: {
      provider: 'local'
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],
    sidebar,
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
