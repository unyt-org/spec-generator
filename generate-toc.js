import fs from 'fs';
import path from 'path';

const docsDir = path.resolve('./');
const ignoreFiles = ['index.md'];
const ignoreDirs = ['node_modules', '.vitepress', '.git', 'pages'];

const mdFiles = [];

function scan(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!ignoreDirs.includes(entry.name)) {
        scan(path.join(dir, entry.name));
      }
    } else if (
      entry.name.endsWith('.md') &&
      !ignoreFiles.includes(entry.name)
    ) {
      mdFiles.push(
        path.relative(docsDir, path.join(dir, entry.name)).replace(/\\/g, '/')
      );
    }
  }
}

scan(path.join(docsDir));

fs.writeFileSync(
  path.join(docsDir, '.vitepress', 'toc.json'),
  JSON.stringify(mdFiles, null, 2)
);

console.log(`TOC generated with ${mdFiles.length} entries.`);
