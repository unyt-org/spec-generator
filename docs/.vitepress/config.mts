import { defineConfig } from 'vitepress'
import markdownItFootnote from 'markdown-it-footnote'
import { withSidebar } from 'vitepress-sidebar'
import { withPwa } from '@vite-pwa/vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import timeline from "vitepress-markdown-timeline";

const vitePressOptions = defineConfig({
  base: '/',
  title: 'DATEX Spec',
  srcDir: './spec',
  outDir: './.vitepress/dist',
  head: [
    ['script',
      {
        defer: '',
        'data-domain': 'unyt.org', // change
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
    publicDir: '../public',
    plugins: [
      groupIconVitePlugin()
    ]
  },
  lastUpdated: true,
  pwa: {
    outDir: '../.vitepress/dist',
    registerType: 'autoUpdate',
    // includeAssets: [
    // 'favicon.ico',
    // 'apple-touch-icon.png',
    // 'mask-icon.svg'
    // ],
    manifest: {
      name: 'DATEX Spec',
      short_name: 'DATEX',
      description: 'DATEX Spec: Unified data specification for next-gen systems',
      theme_color: '#ffffff',
      icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
    },
    workbox: {
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.destination === 'image',
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 30,
            },
          },
        },
      ],
    },
  },
  themeConfig: {
    logo: '/transparent.svg',
    search: {
      provider: 'local'
    },
    nav: [
      { text: 'TOC', link: '/toc' },
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
      pattern: ({ filePath }) => {
        return `https://github.com/unyt-org/datex-specification/blob/main/${filePath.replace(/^spec\//, '')}`;
      },
      text: 'View this page on GitHub'
    }
  }
})

const vitePressSidebarOptions = {
  documentRootPath: '/docs/spec',
  baseRoute: '/',
  scanStartPath: '/', 
  collapsed: false,
  capitalizeFirst: true,
  useTitleFromFileHeading: true,
  manualSortFileNameByPriority: ['README.md'],
  excludePattern: ['toc.md'],
  sortBy: 'asc',
}

export default withPwa(
  withSidebar(vitePressOptions, vitePressSidebarOptions)
)
