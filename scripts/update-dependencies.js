#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Get current file path (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const rootDir = path.join(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend');
const backendDir = path.join(rootDir, 'backend');

// Latest versions of packages
const latestVersions = {
  frontend: {
    dependencies: {
      react: '^18.2.0',
      'react-dom': '^18.2.0',
      next: '^15.3.2', // Updated to Next.js 15 for better performance
      axios: '^1.6.7',
      'react-hook-form': '^7.51.0',
      zustand: '^4.5.2',
      tailwindcss: '^3.4.17',
      postcss: '^8.5.3',
      autoprefixer: '^10.4.21',
      '@supabase/auth-helpers-nextjs': '^0.9.0',
      '@supabase/supabase-js': '^2.39.7',
      '@headlessui/react': '^1.7.18',
      '@heroicons/react': '^2.1.1',
      'chart.js': '^4.4.1',
      'react-chartjs-2': '^5.2.0',
      'date-fns': '^3.3.1',
      'react-datepicker': '^6.2.0',
      '@types/react-datepicker': '^6.0.1',
      jspdf: '^3.0.1',
      'jspdf-autotable': '^5.0.2',
      clsx: '^2.1.0',
      'tailwind-merge': '^2.2.1',
      'next-themes': '^0.2.1',
      'server-only': '^0.0.1',
      sharp: '^0.34.1',
      // Performance optimization packages
      '@vercel/analytics': '^1.2.2',
      'compression': '^1.7.4',
      'critters': '^0.0.20',
      'web-vitals': '^3.5.2',
      // Replace deprecated packages
      '@dnd-kit/core': '^6.3.1',
      '@dnd-kit/sortable': '^8.0.0',
      '@dnd-kit/utilities': '^3.2.2',
      // Add SWR for data fetching
      'swr': '^2.3.3',
    },
    devDependencies: {
      typescript: '^5.3.3',
      '@types/react': '^18.2.61',
      '@types/react-dom': '^18.2.19',
      '@types/node': '^20.11.24',
      eslint: '^8.57.0',
      'eslint-config-next': '^14.1.3',
      prettier: '^3.2.5',
      'prettier-plugin-tailwindcss': '^0.5.11',
      '@typescript-eslint/eslint-plugin': '^7.1.1',
      '@typescript-eslint/parser': '^7.1.1',
    },
  },
  backend: {
    dependencies: {
      '@supabase/supabase-js': '^2.39.7',
      bcryptjs: '^2.4.3',
      cors: '^2.8.5',
      dotenv: '^16.4.5',
      // Use Fastify instead of Express for better performance
      fastify: '^4.26.2',
      '@fastify/cors': '^9.0.1',
      '@fastify/compress': '^7.0.0',
      '@fastify/helmet': '^11.1.1',
      '@fastify/rate-limit': '^9.1.0',
      '@fastify/multipart': '^8.1.0',
      '@fastify/static': '^7.0.1',
      // Keep Express for backward compatibility
      express: '^4.18.3',
      'express-validator': '^7.0.1',
      jsonwebtoken: '^9.0.2',
      morgan: '^1.10.0',
      pg: '^8.11.3',
      helmet: '^8.1.0',
      compression: '^1.7.4',
      'express-rate-limit': '^7.1.5',
      winston: '^3.11.0',
      multer: '^1.4.5-lts.1',
      pdfkit: '^0.14.0',
      exceljs: '^4.4.0',
      zod: '^3.22.4',
      // Use ioredis instead of redis for better performance
      ioredis: '^5.3.2',
      // Add performance monitoring
      pino: '^8.19.0',
      'pino-pretty': '^10.3.1',
      '@opentelemetry/api': '^1.8.0',
      '@opentelemetry/sdk-node': '^0.48.0',
      '@opentelemetry/auto-instrumentations-node': '^0.41.1',
    },
    devDependencies: {
      jest: '^29.7.0',
      nodemon: '^3.1.0',
      supertest: '^6.3.4',
      eslint: '^8.57.0',
      prettier: '^3.2.5',
      '@types/node': '^20.11.24',
      '@types/express': '^4.17.21',
      '@types/bcryptjs': '^2.4.6',
      '@types/cors': '^2.8.17',
      '@types/jsonwebtoken': '^9.0.5',
      '@types/morgan': '^1.9.9',
      typescript: '^5.3.3',
      'ts-node': '^10.9.2',
      tsx: '^4.7.1',
    },
  },
  root: {
    dependencies: {
      '@supabase/supabase-js': '^2.39.7',
      concurrently: '^8.2.2',
      dotenv: '^16.4.5',
      pg: '^8.11.3',
      'cross-env': '^7.0.3',
    },
    devDependencies: {
      husky: '^9.0.11',
      'lint-staged': '^15.2.2',
      nodemon: '^3.1.0',
      typescript: '^5.3.3',
      eslint: '^8.57.0',
      prettier: '^3.2.5',
    },
  },
};

// Deprecated packages to update with overrides
const deprecatedPackages = {
  'glob': '^9.3.5',
  'sourcemap-codec': 'npm:@jridgewell/sourcemap-codec@^1.4.15',
  'react-beautiful-dnd': '@dnd-kit/core@^6.3.1 @dnd-kit/sortable@^8.0.0',
  'redis': 'ioredis@^5.3.2'
};

// Function to update package.json
function updatePackageJson(filePath, updates) {
  // Read the file
  const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Update dependencies
  if (updates.dependencies) {
    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...updates.dependencies,
    };

    // Remove deprecated packages
    for (const pkg of Object.keys(deprecatedPackages)) {
      if (packageJson.dependencies[pkg]) {
        console.log(`Removing deprecated package: ${pkg}`);
        delete packageJson.dependencies[pkg];
      }
    }
  }

  // Update devDependencies
  if (updates.devDependencies) {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      ...updates.devDependencies,
    };

    // Remove deprecated packages
    for (const pkg of Object.keys(deprecatedPackages)) {
      if (packageJson.devDependencies[pkg]) {
        console.log(`Removing deprecated package: ${pkg}`);
        delete packageJson.devDependencies[pkg];
      }
    }
  }

  // Add overrides and resolutions for deprecated packages
  if (!packageJson.overrides) {
    packageJson.overrides = {};
  }

  if (!packageJson.resolutions) {
    packageJson.resolutions = {};
  }

  // Add deprecated packages to overrides and resolutions
  for (const [pkg, replacement] of Object.entries(deprecatedPackages)) {
    if (!replacement.includes(' ')) {
      packageJson.overrides[pkg] = replacement;
      packageJson.resolutions[pkg] = replacement;
    }
  }

  // Write the updated file
  fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2));
}

// Function to run npm install
function runNpmInstall(directory) {
  console.log(`Installing dependencies in ${directory}...`);
  execSync('npm install', { cwd: directory, stdio: 'inherit' });
}

// Main function
async function updateDependencies() {
  try {
    // Update frontend package.json
    console.log('Updating frontend dependencies...');
    updatePackageJson(path.join(frontendDir, 'package.json'), latestVersions.frontend);

    // Update backend package.json
    console.log('Updating backend dependencies...');
    updatePackageJson(path.join(backendDir, 'package.json'), latestVersions.backend);

    // Update root package.json
    console.log('Updating root dependencies...');
    updatePackageJson(path.join(rootDir, 'package.json'), latestVersions.root);

    // Ask for confirmation before installing
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('Do you want to install the updated dependencies? (y/n) ', answer => {
      if (answer.toLowerCase() === 'y') {
        // Install dependencies
        console.log('Installing root dependencies...');
        runNpmInstall(rootDir);

        console.log('Installing frontend dependencies...');
        runNpmInstall(frontendDir);

        console.log('Installing backend dependencies...');
        runNpmInstall(backendDir);

        console.log('All dependencies updated and installed successfully!');
      } else {
        console.log(
          'Dependencies updated in package.json files. Run npm install in each directory to install them.'
        );
      }

      rl.close();
    });
  } catch (error) {
    console.error('Error updating dependencies:', error);
    process.exit(1);
  }
}

updateDependencies();
