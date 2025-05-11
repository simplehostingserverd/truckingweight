const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Convert SVG to PNG
async function convertSvgToPng() {
  try {
    const svgPath = path.join(__dirname, '../public/icons/truck-icon.svg');
    const pngOutputPath = path.join(__dirname, '../public/images/truck-icon.png');

    // Read SVG file
    const svgBuffer = fs.readFileSync(svgPath);

    // Convert to PNG with transparent background
    await sharp(svgBuffer).resize(512, 512).png().toFile(pngOutputPath);

    console.log('Successfully converted SVG to PNG:', pngOutputPath);
  } catch (error) {
    console.error('Error converting SVG to PNG:', error);
  }
}

// Run the conversion
convertSvgToPng();
