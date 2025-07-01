import fs from 'fs';
import path from 'path';

const docsDir = path.resolve('./');
const ignoreDirs = ['node_modules', '.vitepress', '.git', 'pages'];
const ignoreFiles = ['index.md'];

function scan(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let items = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!ignoreDirs.includes(entry.name)) {
        const children = scan(path.join(dir, entry.name));
        if (children.length > 0) {
          items.push({
            text: entry.name,
            items: children
          });
        }
      }
    } else if (
      entry.name.endsWith('.md') &&
      !ignoreFiles.includes(entry.name)
    ) {
      const name = entry.name.replace(/\.md$/, '');
      const relativePath = path
        .relative(docsDir, path.join(dir, name))
        .replace(/\\/g, '/');
      items.push({
        text: name,
        link: `/${relativePath}`
      });
    }
  }
  return items;
}

const sidebar = scan(path.join(docsDir));

fs.writeFileSync(
  path.join(docsDir, '.vitepress', 'sidebar.json'),
  JSON.stringify(sidebar, null, 2)
);

console.log(`Sidebar generated with ${sidebar.length} top-level entries.`);
