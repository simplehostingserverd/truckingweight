#!/usr/bin/env node

/**
 * Script to install dependencies for all parts of the project
 * Usage: npm run install-deps
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

// Helper function to execute commands
function runCommand(command, cwd) {
  try {
    console.log(`${colors.bright}${colors.blue}> ${command}${colors.reset}`);
    execSync(command, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32' ? 'powershell.exe' : '/bin/bash',
    });
    return true;
  } catch (error) {
    console.error(`${colors.red}Failed to execute command: ${command}${colors.reset}`);
    console.error(error.message);
    return false;
  }
}

// Main function
async function main() {
  const rootDir = path.resolve(__dirname, '..');
  const frontendDir = path.join(rootDir, 'frontend');
  const backendDir = path.join(rootDir, 'backend');

  console.log(`\n${colors.bright}${colors.green}=== Installing Dependencies ===${colors.reset}\n`);

  // Check if directories exist
  if (!fs.existsSync(frontendDir)) {
    console.error(`${colors.red}Frontend directory not found: ${frontendDir}${colors.reset}`);
    process.exit(1);
  }

  if (!fs.existsSync(backendDir)) {
    console.error(`${colors.red}Backend directory not found: ${backendDir}${colors.reset}`);
    process.exit(1);
  }

  // Install root dependencies
  console.log(`\n${colors.bright}${colors.yellow}Installing root dependencies...${colors.reset}`);
  if (!runCommand('npm ci', rootDir)) {
    console.error(`${colors.red}Failed to install root dependencies${colors.reset}`);
    process.exit(1);
  }

  // Install frontend dependencies
  console.log(
    `\n${colors.bright}${colors.yellow}Installing frontend dependencies...${colors.reset}`
  );
  if (!runCommand('npm ci', frontendDir)) {
    console.error(`${colors.red}Failed to install frontend dependencies${colors.reset}`);
    process.exit(1);
  }

  // Install backend dependencies
  console.log(
    `\n${colors.bright}${colors.yellow}Installing backend dependencies...${colors.reset}`
  );
  if (!runCommand('npm ci', backendDir)) {
    console.error(`${colors.red}Failed to install backend dependencies${colors.reset}`);
    process.exit(1);
  }

  console.log(
    `\n${colors.bright}${colors.green}All dependencies installed successfully!${colors.reset}\n`
  );
}

// Run the script
main().catch(error => {
  console.error(`${colors.red}An error occurred:${colors.reset}`, error);
  process.exit(1);
});
