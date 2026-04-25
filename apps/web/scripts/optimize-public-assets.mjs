#!/usr/bin/env node
// One-off optimizer for public/ assets. Run with:
//   node apps/web/scripts/optimize-public-assets.mjs
// Replaces the originals in place after writing to a temp file.

import sharp from 'sharp'
import { readFile, writeFile, stat, rename } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const PUBLIC = resolve(here, '..', 'public')

async function size(p) {
  try {
    const s = await stat(p)
    return s.size
  } catch {
    return 0
  }
}

function fmt(bytes) {
  if (!bytes) return '0'
  const units = ['B', 'KB', 'MB']
  let i = 0
  let v = bytes
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${v.toFixed(1)} ${units[i]}`
}

async function replaceWith(target, buffer) {
  const tmp = `${target}.tmp`
  await writeFile(tmp, buffer)
  await rename(tmp, target)
}

async function compress({ name, width, format, quality }) {
  const input = resolve(PUBLIC, name)
  const before = await size(input)
  if (!before) {
    console.log(`SKIP  ${name} (not found)`)
    return
  }
  let pipeline = sharp(input).resize({ width, withoutEnlargement: true })
  if (format === 'jpeg') pipeline = pipeline.jpeg({ quality, mozjpeg: true })
  if (format === 'png') pipeline = pipeline.png({ quality, compressionLevel: 9 })
  const out = await pipeline.toBuffer()
  await replaceWith(input, out)
  const after = await size(input)
  console.log(`OK    ${name.padEnd(20)} ${fmt(before).padStart(8)} -> ${fmt(after).padStart(8)}  (${Math.round((1 - after / before) * 100)}% smaller)`)
}

async function makeOgImage() {
  const target = resolve(PUBLIC, 'og-image.png')
  const logoPath = resolve(PUBLIC, 'logo.png')

  const W = 1200
  const H = 630
  // Brand greens from BRAND_GUIDE: brand-500 #22c55e, brand-700 #15803d
  const bgSvg = `
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#16a34a"/>
          <stop offset="100%" stop-color="#15803d"/>
        </linearGradient>
        <pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.4" fill="rgba(255,255,255,0.06)"/>
        </pattern>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#g)"/>
      <rect width="${W}" height="${H}" fill="url(#dots)"/>
      <text x="80" y="${H - 200}" font-family="-apple-system, system-ui, Helvetica, Arial, sans-serif" font-size="72" font-weight="800" fill="#ffffff">
        Kliekjesclub
      </text>
      <text x="80" y="${H - 130}" font-family="-apple-system, system-ui, Helvetica, Arial, sans-serif" font-size="36" font-weight="600" fill="rgba(255,255,255,0.92)">
        Deel je restjes, maak iemand blij
      </text>
      <text x="80" y="${H - 80}" font-family="-apple-system, system-ui, Helvetica, Arial, sans-serif" font-size="24" font-weight="500" fill="rgba(255,255,255,0.75)">
        Samen tegen voedselverspilling · kliekjesclub.nl
      </text>
    </svg>
  `

  const base = sharp(Buffer.from(bgSvg))

  // Try compositing the logo top-right if it exists.
  let composites = []
  try {
    const logoBuf = await sharp(logoPath)
      .resize({ width: 220, withoutEnlargement: true })
      .png()
      .toBuffer()
    const meta = await sharp(logoBuf).metadata()
    composites.push({
      input: logoBuf,
      top: 60,
      left: W - (meta.width ?? 220) - 60,
    })
  } catch (e) {
    console.log('  (no logo composited:', e.message, ')')
  }

  const buf = await base.composite(composites).png({ quality: 90, compressionLevel: 9 }).toBuffer()
  await writeFile(target, buf)
  console.log(`OK    og-image.png        (created ${fmt(buf.length)})`)
}

async function makeHeroPoster() {
  const target = resolve(PUBLIC, 'hero-poster.jpg')
  const W = 1920
  const H = 1080
  // Warm dark gradient that matches the warm-900/60 overlay used in the hero.
  const svg = `
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g" cx="50%" cy="40%" r="80%">
          <stop offset="0%" stop-color="#3a2a1f"/>
          <stop offset="60%" stop-color="#1f1612"/>
          <stop offset="100%" stop-color="#0d0907"/>
        </radialGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#g)"/>
    </svg>
  `
  const buf = await sharp(Buffer.from(svg)).jpeg({ quality: 70, mozjpeg: true }).toBuffer()
  await writeFile(target, buf)
  console.log(`OK    hero-poster.jpg     (created ${fmt(buf.length)})`)
}

async function main() {
  console.log('--- compressing existing assets ---')
  await compress({ name: 'favicon.png', width: 256, format: 'png', quality: 90 })
  await compress({ name: 'logo.png', width: 512, format: 'png', quality: 90 })
  await compress({ name: 'community.jpg', width: 1600, format: 'jpeg', quality: 80 })
  await compress({ name: 'cta-section.png', width: 1600, format: 'png', quality: 80 })

  console.log('\n--- generating og-image ---')
  await makeOgImage()

  console.log('\n--- generating hero-poster ---')
  await makeHeroPoster()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
