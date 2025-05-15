/**
 * Script to convert CommonJS modules to ESM
 * This script will convert all .js files in the specified directories to ESM
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Directories to process
const directories = [
  'backend/routes/fastify',
  'backend/controllers/fastify',
  'backend/middleware/fastify',
  'backend/services',
  'backend/config',
];

// Function to convert a file from CommonJS to ESM
async function convertFileToESM(filePath) {
  try {
    console.log(`Converting ${filePath} to ESM...`);

    // Read the file content
    const content = await readFile(filePath, 'utf8');

    // Replace require statements with import statements
    let newContent = content.replace(
      /const\s+(\w+|\{\s*[\w\s,]+\})\s+=\s+require\(['"]([^'"]+)['"]\);?/g,
      (match, importName, modulePath) => {
        // Handle destructuring imports
        if (importName.includes('{')) {
          return `import ${importName} from '${modulePath}.js';`;
        }
        // Handle default imports
        return `import ${importName} from '${modulePath}.js';`;
      }
    );

    // Replace module.exports with export default
    newContent = newContent.replace(/module\.exports\s+=\s+(\w+);?/g, 'export default $1;');

    // Replace module.exports = { ... } with export { ... }
    newContent = newContent.replace(/module\.exports\s+=\s+\{([^}]+)\};?/g, (match, exports) => {
      return `export {${exports}};`;
    });

    // Write the modified content back to the file
    await writeFile(filePath, newContent, 'utf8');
    console.log(`Successfully converted ${filePath} to ESM`);
  } catch (error) {
    console.error(`Error converting ${filePath} to ESM:`, error);
  }
}

// Function to process a directory recursively
async function processDirectory(directory) {
  try {
    const files = await readdir(directory);

    for (const file of files) {
      const filePath = path.join(directory, file);
      const fileStat = await stat(filePath);

      if (fileStat.isDirectory()) {
        // Recursively process subdirectories
        await processDirectory(filePath);
      } else if (file.endsWith('.js') && !file.endsWith('.mjs')) {
        // Convert .js files to ESM
        await convertFileToESM(filePath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${directory}:`, error);
  }
}

// Main function to start the conversion process
async function main() {
  console.log('Starting conversion to ESM...');

  for (const directory of directories) {
    console.log(`Processing directory: ${directory}`);
    await processDirectory(directory);
  }

  console.log('Conversion to ESM completed');
}

// Run the main function
main().catch(error => {
  console.error('Error in main function:', error);
  process.exit(1);
});
