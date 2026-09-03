import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generateIcons() {
  const svgPath = path.resolve('public/icons/icon.svg');
  const iconsDir = path.resolve('public/icons');
  const publicDir = path.resolve('public');

  if (!fs.existsSync(svgPath)) {
    console.error('SVG not found at', svgPath);
    process.exit(1);
  }

  const svgBuffer = fs.readFileSync(svgPath);

  console.log('Generating PWA PNG icons from SVG...');

  // 192x192 icon
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, 'icon-192.png'));
  console.log('Generated icon-192.png');

  // 512x512 icon
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon-512.png'));
  console.log('Generated icon-512.png');

  // 512x512 maskable icon with safe-zone padding
  await sharp(svgBuffer)
    .resize(410, 410)
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: { r: 2, g: 6, b: 23, alpha: 1 } // #020617
    })
    .png()
    .toFile(path.join(iconsDir, 'icon-maskable.png'));
  console.log('Generated icon-maskable.png');

  // Apple touch icon (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // Also copy to root public for standard fallbacks
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('Generated favicon.png');

  // Also ensure logo.svg exists in public
  fs.copyFileSync(svgPath, path.join(publicDir, 'logo.svg'));
  console.log('Copied logo.svg to public/logo.svg');

  console.log('All PWA icons generated successfully!');
}

generateIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
