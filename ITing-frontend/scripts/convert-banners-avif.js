#!/usr/bin/env node
/**
 * Convert public/jobportal_banner*.png → .avif với sharp.
 *
 * Banner đè opacity-30 trên hero section nên không cần độ phân giải cao.
 * Resize về max 1920×1080 + AVIF quality 50 → giảm 100×+ vs PNG gốc.
 *
 * Chạy: node scripts/convert-banners-avif.js
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');
const TARGETS = ['jobportal_banner.png', 'jobportal_banner2.png'];
const AVIF_OPTS = {
  quality: 50,     // 0-100, 50 đủ cho hero opacity-30
  effort: 6,       // 0-9 (encode speed vs size), 6 = balanced
};
const RESIZE_MAX = { width: 1920, height: 1080, fit: 'inside', withoutEnlargement: true };

(async () => {
  for (const file of TARGETS) {
    const srcPath = path.join(PUBLIC_DIR, file);
    if (!fs.existsSync(srcPath)) {
      console.warn(`✗ Skip: ${file} không tồn tại`);
      continue;
    }
    const dstPath = srcPath.replace(/\.png$/i, '.avif');
    const srcSize = fs.statSync(srcPath).size;

    try {
      await sharp(srcPath)
        .resize(RESIZE_MAX)
        .avif(AVIF_OPTS)
        .toFile(dstPath);
      const dstSize = fs.statSync(dstPath).size;
      const ratio = (srcSize / dstSize).toFixed(1);
      console.log(
        `✓ ${file}: ${(srcSize/1024).toFixed(0)}KB → ${(dstSize/1024).toFixed(1)}KB (${ratio}× smaller)`
      );
    } catch (err) {
      console.error(`✗ Convert ${file} failed:`, err.message);
      process.exitCode = 1;
    }
  }
})();
