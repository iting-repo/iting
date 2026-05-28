#!/usr/bin/env node
/**
 * Convert PNG/JPG → AVIF + resize đúng kích thước hiển thị.
 *
 * Lighthouse "Improve image delivery" báo tiết kiệm 620KB từ:
 *   - tech-fox-dashboard.png (269K → ~10K, resize 408→205)
 *   - tech-fox.png           (200K → ~10K, resize giữ 320×320)
 *   - fsoft-logo.jpg         (69K → ~3K, resize 280→47)
 *   - logo-iting.png (Header)(69K → ~3K, resize 500→120)
 *   - vin-ai.jpg, vng-logo.png, grab-logo.png — oversized
 *
 * Chạy: node scripts/convert-images-avif.js
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');

const TARGETS = [
  // Tech-fox mascot: hiển thị tối đa 320×320 trên hero, 200×200 dashboard
  { src: 'tech-fox.png',           width: 640, quality: 60, fit: 'inside' },
  { src: 'tech-fox-dashboard.png', width: 400, quality: 60, fit: 'inside' },
  // Company logos: hiển thị tối đa 56×56, 1080p retina → 112×112
  { src: 'fsoft-logo.jpg',  width: 120, quality: 70, fit: 'inside' },
  { src: 'shopee-logo.jpg', width: 120, quality: 70, fit: 'inside' },
  { src: 'tiki-logo.jpg',   width: 120, quality: 70, fit: 'inside' },
  { src: 'viettle-logo.jpg', width: 120, quality: 70, fit: 'inside' },
  { src: 'vin-ai.jpg',      width: 120, quality: 70, fit: 'inside' },
  { src: 'vng-logo.png',    width: 120, quality: 70, fit: 'inside' },
  { src: 'grab-logo.png',   width: 120, quality: 70, fit: 'inside' },
  { src: 'momo-logo.png',   width: 120, quality: 70, fit: 'inside' },
];

const EFFORT = 6; // AVIF encode effort 0-9

(async () => {
  let totalSrc = 0, totalDst = 0;
  for (const { src, width, quality, fit } of TARGETS) {
    const srcPath = path.join(PUBLIC_DIR, src);
    if (!fs.existsSync(srcPath)) {
      console.warn(`✗ Skip: ${src} không tồn tại`);
      continue;
    }
    const dstPath = srcPath.replace(/\.(png|jpe?g)$/i, '.avif');
    const srcSize = fs.statSync(srcPath).size;

    try {
      await sharp(srcPath)
        .resize({ width, fit, withoutEnlargement: true })
        .avif({ quality, effort: EFFORT })
        .toFile(dstPath);
      const dstSize = fs.statSync(dstPath).size;
      const ratio = (srcSize / dstSize).toFixed(1);
      totalSrc += srcSize; totalDst += dstSize;
      console.log(
        `✓ ${src.padEnd(28)} ${(srcSize/1024).toFixed(0).padStart(4)}KB → ${(dstSize/1024).toFixed(1).padStart(5)}KB (${ratio}× smaller)`
      );
    } catch (err) {
      console.error(`✗ ${src}: ${err.message}`);
    }
  }
  console.log(`\nTotal: ${(totalSrc/1024).toFixed(0)}KB → ${(totalDst/1024).toFixed(1)}KB (saved ${((totalSrc-totalDst)/1024).toFixed(0)}KB)`);
})();
