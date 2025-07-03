import fs from 'fs';
import path from 'path';

const docsDir = path.resolve('./docs');
const ignoreFiles = ['index.md', 'contributor.md'];
const ignoreDirs = ['node_modules', '.vitepress', '.git'];
const mdFiles = [];

function extractTitle(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        return trimmed.substring(2).trim();
      }
    }
    
    return path.basename(filePath, '.md');
  } catch (error) {
    console.warn(`Fehler beim Lesen der Datei ${filePath}:`, error.message);
    return path.basename(filePath, '.md');
  }
}

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
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(docsDir, fullPath).replace(/\\/g, '/');
      const title = extractTitle(fullPath);
      
      mdFiles.push({
        path: relativePath,
        title: title
      });
    }
  }
}

scan(docsDir);

mdFiles.sort((a, b) => a.path.localeCompare(b.path));

fs.writeFileSync(
  path.join(docsDir, 'toc.json'),
  JSON.stringify(mdFiles, null, 2)
);

console.log(`TOC generated with ${mdFiles.length} entries.`);
console.log('Sample entries:');
mdFiles.slice(0, 3).forEach(file => {
  console.log(`  ${file.path} -> "${file.title}"`);
});