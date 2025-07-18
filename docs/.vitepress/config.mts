import { defineConfig } from 'vitepress'
import markdownItFootnote from 'markdown-it-footnote'
import { withPwa } from '@vite-pwa/vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import timeline from "vitepress-markdown-timeline";
import AutoSidebar from 'vite-plugin-vitepress-auto-sidebar'

const vitePressOptions = defineConfig({
  base: '/',
  title: 'DATEX Specification',
  srcDir: './spec',
  outDir: './.vitepress/dist',
  rewrites(id) {
    let newId = id.replace(/^[A-Za-z0-9]+_/, '').replace(/_/g, '-').toLocaleLowerCase();
    return newId;
  },
  cleanUrls: true,
  head: [
    ['meta', { property: 'og:title', content: 'DATEX Specification' }],
    ['meta', { property: 'og:description', content: 'DATEX Specification' }],
    ['meta', { property: 'og:image', content: '/datex.png' }],
    ['meta', { property: 'og:url', content: 'https://datex.unyt.org' }],
    ['meta', { property: 'og:type', content: 'website' }],

    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: '/datex.png' }],
    ['meta', { name: 'twitter:title', content: 'DATEX Specification' }],
    ['meta', { name: 'twitter:description', content: 'Datax Specification' }],
    ['script',
      {
        defer: '',
        'data-domain': 'datex.unyt.org',
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
          const processedItems =  items.map(item => {
            if (item.link && item.text) {
              item.link = item.link.replace(/\/([0-9]+|[A-Za-z]+[0-9]+)_/, '/').replace(/_/g, '-').toLowerCase();
              item.text = item.text.replace(/^([0-9]+|[A-Za-z]+[0-9]+)_/, '');
            }

            return item;
          });
          const readmeIndex = processedItems.findIndex(item => 
            item.link && item.link.toLowerCase().includes('readme')
          );
          
          if (readmeIndex !== -1) {
            const readmeItem = processedItems.splice(readmeIndex, 1)[0];
            readmeItem.text = 'Introduction';
            processedItems.unshift(readmeItem);
          }
          return processedItems;
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
      background_color: '#ffffff',
      display: 'standalone',
      start_url: '/',
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
      globPatterns: [
        '**/*.{js,css,html,ico,png,jpg,jpeg,gif,webp,svg,woff,woff2,ttf,eot}',
        'assets/**/*'
      ],
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.destination === 'document',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'pages-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 7
            },
            networkTimeoutSeconds: 3,
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: ({ request, url }) => {
            return request.destination === 'image' || 
                   /\.(png|jpg|jpeg|gif|webp|svg|ico)(\?.*)?$/i.test(url.pathname)
          },
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-cache',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 60 * 60 * 24 * 30
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: ({ url }) => {
            return url.pathname.startsWith('/') && 
                   /\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|woff|woff2|ttf|eot)(\?.*)?$/i.test(url.pathname)
          },
          handler: 'CacheFirst',
          options: {
            cacheName: 'static-assets',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 60 * 60 * 24 * 30
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style',
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'js-css-cache',
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ],
      skipWaiting: true,
      clientsClaim: true,
      cleanupOutdatedCaches: true
    },
    devOptions: {
      enabled: false,
      type: 'module'
    }
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