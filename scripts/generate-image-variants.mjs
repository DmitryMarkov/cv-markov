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
