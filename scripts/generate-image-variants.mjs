// sharp is intentionally not declared in package.json — it's pulled in
// transitively by `favicons` (^0.33.1, which for major=0 means "0.33.x
// only"). Adding it here would resolve to a different 0.x line and
// install a second copy of sharp (~70 MB native addon). When favicons
// bumps its sharp constraint, Renovate updates the whole chain in one
// PR. See CLAUDE.md "Notes" for context.
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, basename } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const imagesDir = resolve(here, '..', 'assets', 'images')

const inputs = ['avatar-dm.png', 'avatar-dm-2x.png']

for (const file of inputs) {
  const input = resolve(imagesDir, file)
  const output = resolve(imagesDir, file.replace(/\.png$/, '.webp'))
  const info = await sharp(input).webp({ quality: 85 }).toFile(output)
  console.log(`✓ ${basename(output)} (${(info.size / 1024).toFixed(1)} KiB)`)
}
