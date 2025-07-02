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
  base: '/',
  title: "DATEX Spec",
  head: [
    ['script', { src: 'https://unpkg.com/typescript@latest/lib/typescript.js' }],
    ['script', { src: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs/loader.min.js' }],
    [
      'link',
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/transparent.svg'
      }
    ]
    
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/transparent.svg',
    search: {
      provider: 'local'
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Files', link: '/TypescriptPlayground' },
      { text: 'Team', link: '/contributor'}
    ],
    sidebar,
    socialLinks: [
      { icon: 'github', link: 'https://github.com/unyt-org' }
    ],
    footer: {
      message: `
        <div style="display: flex; flex-direction: row; gap: 1rem;">
          <span>© ${new Date().getFullYear()} unyt.org e.V.</span>
          <div style="display: flex; justify-content: center; gap: 1rem;">
            <a href="https://unyt.org/terms-of-service" target="_blank">Terms</a>
            <a href="https://unyt.org/privacy" target="_blank">Privacy</a>
            <a href="https://unyt.org/legal-notice" target="_blank">Legal</a>
          </div>  
        </div>
      `
    }
  }
})
