/**
 * Script to download a velociraptor sound effect
 * Run with: node scripts/download-velociraptor-sound.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// URL of a velociraptor sound effect
const soundUrl = 'https://assets.mixkit.co/sfx/preview/mixkit-dinosaur-monster-roar-1743.mp3';
const outputPath = path.join(__dirname, 'velociraptor-roar.mp3');

/**
 * Download a file from a URL
 * @param {string} url - URL to download from
 * @param {string} dest - Destination file path
 * @returns {Promise<void>}
 */
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    
    https.get(url, (response) => {
      // Check if response is successful
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download file: ${response.statusCode}`));
        return;
      }
      
      // Pipe the response to the file
      response.pipe(file);
      
      // Handle errors during download
      response.on('error', (err) => {
        fs.unlink(dest, () => {}); // Delete the file on error
        reject(err);
      });
      
      // Close the file when download is complete
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded velociraptor sound to: ${dest}`);
        resolve();
      });
      
      // Handle errors during file writing
      file.on('error', (err) => {
        fs.unlink(dest, () => {}); // Delete the file on error
        reject(err);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

// Main function
async function main() {
  try {
    console.log('Downloading velociraptor sound effect...');
    await downloadFile(soundUrl, outputPath);
    console.log('Download complete!');
  } catch (error) {
    console.error('Error downloading sound:', error);
  }
}

// Run the main function
main();
