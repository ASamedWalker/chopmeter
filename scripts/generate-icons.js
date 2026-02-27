/**
 * Simple script to generate placeholder PWA icons.
 * Run: node scripts/generate-icons.js
 *
 * For production, replace these with proper designed icons.
 * This creates minimal valid PNGs using a canvas approach.
 */

const fs = require("fs");
const path = require("path");

// Minimal 1x1 green pixel PNG as base
// In production, use a proper icon design tool
function createPlaceholderPNG(size) {
  // PNG file structure for a simple colored square
  // This is a minimal valid PNG — replace with real icons for production
  const { createCanvas } = (() => {
    try {
      return require("canvas");
    } catch {
      return { createCanvas: null };
    }
  })();

  if (createCanvas) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#102213";
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, size * 0.18);
    ctx.fill();

    // Lightning bolt
    ctx.fillStyle = "#2bee4b";
    const s = size / 4;
    ctx.beginPath();
    ctx.moveTo(s * 2.2, s * 0.5);
    ctx.lineTo(s * 1.2, s * 2);
    ctx.lineTo(s * 1.8, s * 2);
    ctx.lineTo(s * 1.5, s * 3.5);
    ctx.lineTo(s * 2.8, s * 1.7);
    ctx.lineTo(s * 2.2, s * 1.7);
    ctx.closePath();
    ctx.fill();

    return canvas.toBuffer("image/png");
  }

  // Fallback: write a minimal 1x1 PNG that serves as valid placeholder
  console.log(
    `Note: 'canvas' package not found. Creating minimal placeholder for ${size}x${size}.`
  );
  console.log(
    "For proper icons, install 'canvas' package or use an image editor."
  );

  // Minimal valid PNG (1x1 green pixel) — browsers will scale it
  const png = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
    0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0x90, 0xfb, 0xcf, 0x00,
    0x00, 0x00, 0x82, 0x00, 0x81, 0xa7, 0xf9, 0x2a, 0x10, 0x00, 0x00, 0x00,
    0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
  ]);
  return png;
}

const iconsDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(iconsDir, { recursive: true });

[192, 512].forEach((size) => {
  const buffer = createPlaceholderPNG(size);
  const filePath = path.join(iconsDir, `icon-${size}.png`);
  fs.writeFileSync(filePath, buffer);
  console.log(`Created ${filePath}`);
});
