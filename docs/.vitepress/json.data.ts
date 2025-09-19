import fs from 'node:fs'

export default {
  watch: ['../spec/assets/**/*.json'],
  load(watchedFiles) {
    console.log('watchedFiles', watchedFiles);
    return Object.fromEntries(
      watchedFiles.map((file) => {
        return [file.replace("docs/spec", ""), JSON.parse(fs.readFileSync(file, 'utf-8'))]
      })
    )
  }
}