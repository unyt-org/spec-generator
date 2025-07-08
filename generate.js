import fs from 'fs';
import path from 'path';

const docsDir = path.resolve('./docs/spec');
const customDocsDir = path.resolve('./docs/spec2');
const ignoreFiles = ['index.md', 'contributor.md', 'toc.md', 'overview.md'];
const ignoreDirs = ['node_modules', '.vitepress', '.git'];
const mdFiles = [];

function moveCustomFiles(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      moveCustomFiles(srcPath, destPath);
    } else if (entry.name.endsWith('.md')) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

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
    console.warn(`Error reading the file ${filePath}:`, error.message);
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
moveCustomFiles(customDocsDir, docsDir);
scan(docsDir);

const readmeIndex = mdFiles.findIndex(file => 
  file.path.toLowerCase().endsWith('readme.md')
);

let readmeEntry;
if (readmeIndex !== -1) {
  readmeEntry = mdFiles.splice(readmeIndex, 1)[0];
}

mdFiles.sort((a, b) => a.path.localeCompare(b.path));

if (readmeEntry) {
  mdFiles.unshift(readmeEntry);
}

fs.writeFileSync(
  path.join(docsDir, 'toc.json'),
  JSON.stringify(mdFiles, null, 2)
);

console.log(`TOC generated with ${mdFiles.length} entries.`);
console.log('Sample entries:');
mdFiles.slice(0, 3).forEach(file => {
  console.log(`  ${file.path} -> "${file.title}"`);
});