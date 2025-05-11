import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define icon sizes
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Input and output paths
const inputSvg = path.join(__dirname, '../frontend/public/icons/truck-icon.svg');
const outputDir = path.join(__dirname, '../frontend/public/icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate icons for each size
async function generateIcons() {
  console.log('Generating PWA icons...');

  for (const size of sizes) {
    // For the 512x512 size, use the detailed SVG
    const sourceSvg =
      size === 512 ? path.join(__dirname, '../frontend/public/icons/icon-512x512.svg') : inputSvg;

    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

    try {
      await sharp(sourceSvg).resize(size, size).png().toFile(outputPath);

      console.log(`Created icon: ${outputPath}`);
    } catch (error) {
      console.error(`Error creating icon ${size}x${size}:`, error);
    }
  }

  console.log('Icon generation complete!');
}

// Run the icon generation
generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
