import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import postcss from 'postcss'
import { readFile, writeFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))

const cssLinks = `
    <link rel="preload" href="/main.css" as="style" />
    <link href="/main.css" rel="stylesheet" />
    <link href="/dark-theme.css" rel="stylesheet" media="(prefers-color-scheme: dark)" />`

const cssEntries = ['main.css', 'dark-theme.css']

const buildPostcss = () =>
  postcss([
    autoprefixer(),
    cssnano({
      preset: ['default', { discardComments: { removeAll: true } }],
    }),
  ])

const writeProcessedCss = async (outDir) => {
  const processor = buildPostcss()
  for (const file of cssEntries) {
    const from = resolve(import.meta.dirname, 'src', file)
    const to = resolve(outDir, file)
    const css = await readFile(from, 'utf8')
    const result = await processor.process(css, {
      from,
      to,
      map: { inline: false },
    })
    await writeFile(to, `${result.css}\n/*# sourceMappingURL=${file}.map */\n`)
    if (result.map) await writeFile(`${to}.map`, result.map.toString())
  }
}

export default defineConfig({
  root: 'src',
  publicDir: false,
  build: {
    outDir: '../build',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: { input: 'index.html' },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: resolve(import.meta.dirname, 'assets').replaceAll('\\', '/'),
          dest: '.',
        },
      ],
    }),
    {
      name: 'inject-version-and-css',
      transformIndexHtml: {
        order: 'post',
        handler(html) {
          return html
            .replaceAll('$version', pkg.version)
            .replace('<!-- vite-css-injection -->', cssLinks.trim())
        },
      },
    },
    (() => {
      let outDir = null
      return {
        name: 'postcss-static-build',
        apply: 'build',
        configResolved(config) {
          outDir = resolve(config.root, config.build.outDir)
        },
        async closeBundle() {
          await writeProcessedCss(outDir)
        },
      }
    })(),
    {
      name: 'postcss-static-dev',
      apply: 'serve',
      configureServer(server) {
        const devProcessor = postcss([autoprefixer()])
        server.middlewares.use(async (req, res, next) => {
          const url = req.url?.split('?')[0] ?? ''
          const file = url.replace(/^\//, '')
          if (!cssEntries.includes(file)) return next()
          try {
            const from = resolve(import.meta.dirname, 'src', file)
            const css = await readFile(from, 'utf8')
            const result = await devProcessor.process(css, { from })
            res.setHeader('Content-Type', 'text/css')
            res.end(result.css)
          } catch (err) {
            next(err)
          }
        })
      },
    },
  ],
})
