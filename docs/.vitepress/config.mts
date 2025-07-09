import { defineConfig } from 'vitepress'
import markdownItFootnote from 'markdown-it-footnote'
// import { withSidebar } from 'vitepress-sidebar'
import { withPwa } from '@vite-pwa/vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import timeline from "vitepress-markdown-timeline";
import AutoSidebar from 'vite-plugin-vitepress-auto-sidebar'

const vitePressOptions = defineConfig({
  base: '/',
  title: 'DATEX Spec',
  srcDir: './spec',
  outDir: './.vitepress/dist',
  rewrites: {
    ':prefix([A-Za-z0-9]+)_:slug(.+).md': ':slug.md'
  },
  cleanUrls: true,
  head: [
    ['script',
      {
        defer: '',
        'data-domain': 'datex.unyt.org', // change
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
      groupIconVitePlugin(),
      AutoSidebar({
        sideBarItemsResolved(items) {
          return items.map(item => {
            if (item.link && item.text) {
              item.link = item.link.replace(/\/([0-9]+|[A-Za-z]+[0-9]+)_/, '/');
              item.text = item.text.replace(/^([0-9]+|[A-Za-z]+[0-9]+)_/, '');
            }

            if ('items' in item && Array.isArray(item.items)) {
              item.items = item.items.map(sub => {
                if (sub.link && sub.text) {
                  sub.link = sub.link.replace(/\/([0-9]+|[A-Za-z]+[0-9]+)_/, '/');
                  sub.text = sub.text.replace(/^([0-9]+|[A-Za-z]+[0-9]+)_/, '');
                }
                return sub;
              });
            }

            return item;
          });
        },
        path: "/docs/spec",
        titleFromFile: true,
        ignoreList: ['toc.md', 'overview.md', 'contributor.md', 'index.md'],
      })
    ]
  },
  lastUpdated: true,
  pwa: {
    outDir: '../.vitepress/dist',
    registerType: 'autoUpdate',
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
      { icon: 'github', link: 'https://github.com/unyt-org/datex-specification' }
    ],
    footer: {
      message: `© ${new Date().getFullYear()} unyt.org e.V. | <a href="https://unyt.org/terms-of-service" target="_blank">Terms</a> | <a href="https://unyt.org/privacy" target="_blank">Privacy</a> | <a href="https://unyt.org/legal-notice" target="_blank">Legal</a>`
    },
    editLink: {
      pattern: ({ filePath }) => {
        return `https://github.com/unyt-org/datex-specification/blob/main/${filePath.replace(/^spec\//, '')}`;
      },
      text: 'View this page on GitHub'
    }
  }
})

export default withPwa(vitePressOptions)