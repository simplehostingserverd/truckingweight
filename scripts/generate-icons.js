const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

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
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    
    try {
      await sharp(inputSvg)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
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
