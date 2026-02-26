import { defineConfig } from 'vitepress'
import markdownItFootnote from 'markdown-it-footnote'
import { withPwa } from '@vite-pwa/vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import timeline from "vitepress-markdown-timeline";
import path from 'node:path';
import { generateSidebar } from 'vitepress-sidebar';

const rawSidebar = generateSidebar([
  {
    documentRootPath: 'docs/spec',
    useTitleFromFileHeading: true,
    hyphenToSpace: true,
    underscoreToSpace: true,
    excludeByGlobPattern: ['toc.md', 'overview.md', 'contributor.md','index.md','contributing.md'],
  },
]);

function postProcess(sidebar) {
  const result = {};

  for (const key in sidebar) {
    const section = sidebar[key];

    result[key] = {
      ...section,
      items: processItems(section.items)
    };
  }

  return result;
}

function processItems(items) {
  const mappedItems = items.map(item => {
    // If it has children (nested groups), recurse
    if (item.items) {
      return {
        ...item,
        items: processItems(item.items)
      };
    }

    if (item.link && item.text) {
      item.link = item.link
        .replace(/\/([0-9]+|[A-Za-z]+[0-9]+)_/, '/')
        .replace(/_/g, '-')
        .toLowerCase()
        .replace(/^\//, '');

      item.text = item.text
        .replace(/^([0-9]+|[A-Za-z]+[0-9]+)_/, '');
    }
    return item;
  });

  // add readme with text "Introduction" to the beginning of the items array
  const readmeIndex = mappedItems.findIndex(item => 
    item.link && item.link.toLowerCase().includes('readme')
  );
  
  if (readmeIndex !== -1) {
    const readmeItem = mappedItems.splice(readmeIndex, 1)[0];
    readmeItem.text = 'Introduction';
    mappedItems.unshift(readmeItem);
  }

  return mappedItems;
}

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
      resolve: {
        alias: [
            { find: '@', replacement: path.resolve(__dirname, 'src') },
        ],
    },
    build: {
      target: 'esnext',
    },
    esbuild: {
      target: 'esnext'
    },
    optimizeDeps: {
      exclude: ['@unyt/datex']
    },
    plugins: [
      groupIconVitePlugin(),
    ]
  },
  lastUpdated: true,
  themeConfig: {
    logo: '/transparent.svg',
    search: {
      provider: 'local'
    },
    sidebar: postProcess(rawSidebar),
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