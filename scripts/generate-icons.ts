import sharp from 'sharp'
import path from 'node:path'
import fs from 'node:fs'

const ROOT = path.resolve(import.meta.dirname, '..')
const SOURCE = path.join(ROOT, 'public', 'android-chrome-512x512.png')
const OUTPUT_DIR = path.join(ROOT, 'public', 'icons')

const STANDARD_SIZES = [72, 96, 128, 144, 152, 192, 384, 512] as const
const MASKABLE_SIZES = [192, 512] as const
const MASKABLE_PADDING = 0.2 // 20% safe-zone padding

async function generateStandardIcon(size: number): Promise<void> {
  const outputPath = path.join(OUTPUT_DIR, `icon-${size}.png`)
  await sharp(SOURCE)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(outputPath)
  console.log(`  icon-${size}.png`)
}

async function generateMaskableIcon(size: number): Promise<void> {
  const outputPath = path.join(OUTPUT_DIR, `icon-${size}-maskable.png`)
  const innerSize = Math.round(size * (1 - MASKABLE_PADDING * 2))
  const padding = Math.round(size * MASKABLE_PADDING)

  const resized = await sharp(SOURCE)
    .resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 255 },
    },
  })
    .composite([{ input: resized, top: padding, left: padding }])
    .png()
    .toFile(outputPath)

  console.log(`  icon-${size}-maskable.png`)
}

async function main(): Promise<void> {
  if (!fs.existsSync(SOURCE)) {
    console.error(`Source icon not found: ${SOURCE}`)
    process.exit(1)
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  console.log('Generating standard icons...')
  await Promise.all(STANDARD_SIZES.map(generateStandardIcon))

  console.log('Generating maskable icons...')
  await Promise.all(MASKABLE_SIZES.map(generateMaskableIcon))

  console.log(`\nDone! Generated ${STANDARD_SIZES.length + MASKABLE_SIZES.length} icons in public/icons/`)
}

main()
