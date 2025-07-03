import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SPEC_REPO = 'https://github.com/unyt-org/datex-specification.git'
const TEMP_DIR = path.join(__dirname, '.temp-spec')
const TARGET_DIR = path.join(__dirname, 'docs')

function updateRepo() {
  try {
    if (fs.existsSync(TEMP_DIR)) {
      execSync(`git -C ${TEMP_DIR} pull`, { stdio: 'inherit' })
    } else {
      execSync(`git clone ${SPEC_REPO} ${TEMP_DIR} --depth 1`, { stdio: 'inherit' })
    }
  } catch (err) {
    console.error('Failed to update spec repo:', err)
    process.exit(1)
  }
}

function copyAllFiles() {
  try {
    fs.cpSync(TEMP_DIR, TARGET_DIR, {
      recursive: true,
      force: true,
      filter: (src) => {
        const rel = path.relative(TEMP_DIR, src)
        if (rel.startsWith('.git')) return false
        return true
      }
    })
    console.log(`Copied from ${TEMP_DIR} to ${TARGET_DIR}`)
  } catch (err) {
    console.error('Error copying files:', err)
    process.exit(1)
  }
}

async function main() {
  try {
    updateRepo()
    copyAllFiles()
    console.log('Specification update complete!')
  } catch (err) {
    console.error('Error:', err)
    process.exit(1)
  } 
}

main()
