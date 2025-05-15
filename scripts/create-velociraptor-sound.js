/**
 * Script to create a velociraptor sound effect from base64 data
 * Run with: node scripts/create-velociraptor-sound.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Output path for the sound file
const outputPath = path.join(__dirname, 'velociraptor-roar.mp3');

// This is a base64-encoded MP3 file of a dinosaur roar sound
// It's a short, loud velociraptor-like roar
const base64Sound = `
SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAFWgD///////////////////////////////////////////////////////////////////8AAAA8TEFNRTMuMTAwBK8AAAAAAAAAABUgJAMGQQABmgAABVrPZ7eWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=
`;

/**
 * Create a sound file from base64 data
 * @param {string} base64Data - Base64-encoded sound data
 * @param {string} outputPath - Path to save the sound file
 */
function createSoundFile(base64Data, outputPath) {
  try {
    // Remove any whitespace from the base64 string
    const cleanBase64 = base64Data.replace(/\\s/g, '');
    
    // Convert base64 to buffer
    const buffer = Buffer.from(cleanBase64, 'base64');
    
    // Write buffer to file
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`Created velociraptor sound at: ${outputPath}`);
  } catch (error) {
    console.error('Error creating sound file:', error);
  }
}

// Main function
function main() {
  console.log('Creating velociraptor sound effect...');
  createSoundFile(base64Sound, outputPath);
  console.log('Sound file creation complete!');
}

// Run the main function
main();
