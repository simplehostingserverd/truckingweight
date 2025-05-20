/**
 * Copyright (c) 2025 Cosmo Exploit Group LLC. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cosmo Exploit Group LLC Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cosmo Exploit Group LLC and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

/**
 * Root index.js file for running the application
 * This file is used to coordinate running both the frontend and backend
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Define paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = __dirname;
const frontendDir = path.join(rootDir, 'frontend');
const backendDir = path.join(rootDir, 'backend');

console.log('Starting TruckingWeight application...');
console.log('Root directory:', rootDir);
console.log('Frontend directory:', frontendDir);
console.log('Backend directory:', backendDir);

// Function to spawn a process
function spawnProcess(command, args, options) {
  const proc = spawn(command, args, options);

  proc.stdout.on('data', data => {
    console.log(`[${options.cwd}] ${data}`);
  });

  proc.stderr.on('data', data => {
    console.error(`[${options.cwd}] ${data}`);
  });

  proc.on('close', code => {
    console.log(`Process in ${options.cwd} exited with code ${code}`);
  });

  return proc;
}

// Start frontend
console.log('Starting frontend...');
const frontendProc = spawnProcess('npm', ['run', 'dev'], {
  cwd: frontendDir,
  stdio: 'pipe',
  shell: true,
});

// Start backend
console.log('Starting backend...');
const backendProc = spawnProcess('npm', ['run', 'dev'], {
  cwd: backendDir,
  stdio: 'pipe',
  shell: true,
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down...');
  frontendProc.kill();
  backendProc.kill();
  process.exit(0);
});

console.log('Both frontend and backend are starting. Press Ctrl+C to stop.');
