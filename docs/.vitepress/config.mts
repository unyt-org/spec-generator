import { defineConfig } from 'vitepress'
import markdownItFootnote from 'markdown-it-footnote'
import { withSidebar } from 'vitepress-sidebar'
import { withPwa } from '@vite-pwa/vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import timeline from "vitepress-markdown-timeline";

const vitePressOptions = defineConfig({
  base: '/',
  title: 'DATEX Spec',
  head: [
    ['script',
      {
        defer: '',
        'data-domain': 'unyt.org',
        src: 'https://plausible.unyt.org/js/script.file-downloads.hash.outbound-links.pageview-props.revenue.tagged-events.js'
      }
    ],
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
  markdown: {
    config(md) {
      md.use(markdownItFootnote)
      md.use(groupIconMdPlugin)
      md.use(timeline);
    },
    math: true
  },
  vite: {
    plugins: [
      groupIconVitePlugin()
    ]
  },
  lastUpdated: true,
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'DATEX Spec',
      short_name: 'DATEX',
    }
  },
  themeConfig: {
    logo: '/transparent.svg',
    search: {
      provider: 'local'
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Files', link: '/TypescriptPlayground' },
      { text: 'Team', link: '/contributor' }
    ],
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
    },
    editLink: {
      pattern: 'https://github.com/unyt-org/datex-specification/edit/main/:path',
      text: 'Edit this page on GitHub'
    },
  }
})

const vitePressSidebarOptions = {
  documentRootPath: '/docs/',
  collapsed: false,
  capitalizeFirst: true,
  useTitleFromFileHeading: true,
  sortBy: 'asc',
}

export default withPwa(
  withSidebar(vitePressOptions, vitePressSidebarOptions)
)
