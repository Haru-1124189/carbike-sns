// Generate favicon.ico from RevLink PNGs
// Usage:
//  1) npm i -D sharp to-ico
//  2) node ./scripts/generate-favicon.mjs

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import toIco from 'to-ico';

const publicDir = path.resolve(process.cwd(), 'frontend', 'public');
const srcPng = path.join(publicDir, 'revlink-512.png');

async function main() {
  if (!fs.existsSync(srcPng)) {
    console.error('[favicon] PNG source not found:', srcPng);
    process.exit(1);
  }

  // Common favicon sizes for Windows/Browser
  // Include 128 and 256 for Windows shortcut icons
  const sizes = [16, 24, 32, 48, 64, 128, 256];
  const pngBuffers = [];
  for (const size of sizes) {
    const buf = await sharp(srcPng)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    pngBuffers.push(buf);
  }

  const icoBuffer = await toIco(pngBuffers);
  const outPath = path.join(publicDir, 'favicon.ico');
  fs.writeFileSync(outPath, icoBuffer);
  console.log('[favicon] Generated:', outPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


