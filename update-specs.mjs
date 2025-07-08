import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SPEC_REPO = 'https://github.com/unyt-org/datex-specification.git'
const TARGET_DIR = path.join(__dirname, 'docs/spec')

function updateRepo() {
  try {
    if (fs.existsSync(path.join(TARGET_DIR, '.git'))) {
      execSync(`git -C ${TARGET_DIR} fetch`, { stdio: 'inherit' })
      execSync(`git -C ${TARGET_DIR} reset --hard origin/main`, { stdio: 'inherit' })
      execSync(`git -C ${TARGET_DIR} clean -fd`, { stdio: 'inherit' })
    } else {
      execSync(`git clone ${SPEC_REPO} ${TARGET_DIR} --depth 1`, { stdio: 'inherit' })
    }
  } catch (err) {
    console.error('Failed to update spec repo:', err)
    process.exit(1)
  }
}

async function main() {
  try {
    updateRepo()
    console.log('Specification update complete!')
  } catch (err) {
    console.error('Error:', err)
    process.exit(1)
  }
}

main()
