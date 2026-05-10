import { favicons } from 'favicons'
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const source = resolve(root, 'materials/icon-transparent.png')
const outDir = resolve(root, 'assets/favicons')
const tagsFile = resolve(root, 'src/_favicon-tags.html')

const pkg = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))

const response = await favicons(source, {
  path: '/assets/favicons',
  appName: 'Dmitry Markov',
  appShortName: 'Dmitry Markov',
  appDescription: pkg.description,
  background: '#ffffff',
  theme_color: '#ffffff',
  display: 'standalone',
  orientation: 'any',
  start_url: '/',
  icons: {
    android: true,
    appleIcon: true,
    appleStartup: false,
    favicons: true,
    windows: true,
    yandex: false,
  },
})

await rm(outDir, { recursive: true, force: true })
await mkdir(outDir, { recursive: true })

await Promise.all([
  ...response.images.map((i) =>
    writeFile(resolve(outDir, i.name), i.contents)
  ),
  ...response.files.map((f) =>
    writeFile(
      resolve(outDir, f.name),
      f.contents.endsWith('\n') ? f.contents : `${f.contents}\n`
    )
  ),
  writeFile(
    tagsFile,
    `${response.html
      .join('\n')
      .replaceAll(
        /((?:href|content)="\/assets\/favicons\/[^"]+)"/g,
        '$1?v=$$version"'
      )}\n`
  ),
])

console.log(
  `Generated ${response.images.length} icons and ${response.files.length} manifest files in assets/favicons/`
)
console.log(`HTML tags written to ${tagsFile} — copy them into src/index.html`)
