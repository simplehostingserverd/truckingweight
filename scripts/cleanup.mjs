/**
 * Enhanced Cleanup script to ensure all processes are properly terminated
 * when the application is stopped.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { setTimeout } from 'timers/promises';

const execAsync = promisify(exec);

// Configuration
const PROCESS_PATTERNS = [
  'server-fastify.js',
  'next dev',
  'nodemon server-fastify',
  'truckingsemis-frontend',
  'truckingsemis-backend',
  'concurrently',
  'npm run dev',
];

const PORTS_TO_CHECK = [3000, 3001, 3002, 3003, 3004, 3005, 5000];

// Function to find and kill processes by pattern
async function findAndKillProcessesByPattern() {
  try {
    // Get current process ID to exclude it from killing
    const currentPid = process.pid.toString();

    // Get a list of all processes
    const { stdout } = await execAsync('ps aux');

    // Parse the output to find PIDs
    const lines = stdout.split('\n');
    const pidsByPattern = {};
    const allPids = [];

    // Find PIDs for each pattern
    for (const pattern of PROCESS_PATTERNS) {
      pidsByPattern[pattern] = [];

      for (const line of lines) {
        if (line.includes(pattern)) {
          // Extract the PID (second column in ps aux output)
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 2) {
            const pid = parts[1];
            // Skip the current process and its parent
            if (
              pid &&
              !isNaN(parseInt(pid)) &&
              !allPids.includes(pid) &&
              pid !== currentPid &&
              pid !== process.ppid?.toString()
            ) {
              pidsByPattern[pattern].push(pid);
              allPids.push(pid);
            }
          }
        }
      }
    }

    // Kill processes for each pattern
    let killedCount = 0;
    for (const [pattern, pids] of Object.entries(pidsByPattern)) {
      if (pids.length > 0) {
        console.log(`Found ${pids.length} processes matching "${pattern}": ${pids.join(', ')}`);

        for (const pid of pids) {
          try {
            await execAsync(`kill -9 ${pid}`);
            killedCount++;
          } catch (error) {
            console.error(`Failed to kill process ${pid}:`, error.message);
          }
        }
      }
    }

    if (killedCount > 0) {
      console.log(`Terminated ${killedCount} processes by pattern`);
      // Wait a moment for processes to fully terminate
      await setTimeout(1000);
    } else {
      console.log('No matching processes found by pattern');
    }
  } catch (error) {
    console.error('Error finding processes by pattern:', error);
  }
}

// Function to find and kill processes by port
async function findAndKillProcessesByPort() {
  try {
    let killedCount = 0;

    for (const port of PORTS_TO_CHECK) {
      try {
        const { stdout } = await execAsync(`lsof -i :${port} -t`);
        const pids = stdout.trim().split('\n').filter(Boolean);

        if (pids.length > 0) {
          console.log(`Found processes using port ${port}: ${pids.join(', ')}`);

          for (const pid of pids) {
            try {
              await execAsync(`kill -9 ${pid}`);
              killedCount++;
              console.log(`Terminated process ${pid} using port ${port}`);
            } catch (error) {
              console.error(`Failed to kill process ${pid}:`, error.message);
            }
          }
        }
      } catch (error) {
        // lsof returns non-zero exit code if no process is found
        // This is expected, so we ignore this error
      }
    }

    if (killedCount > 0) {
      console.log(`Terminated ${killedCount} processes by port`);
      // Wait a moment for processes to fully terminate
      await setTimeout(1000);
    } else {
      console.log('No processes found using the specified ports');
    }
  } catch (error) {
    console.error('Error finding processes by port:', error);
  }
}

// Run the enhanced cleanup
async function runEnhancedCleanup() {
  console.log('Starting enhanced cleanup...');

  // First kill processes by pattern
  await findAndKillProcessesByPattern();

  // Then kill processes by port
  await findAndKillProcessesByPort();

  console.log('Enhanced cleanup completed');
}

// Run the cleanup
runEnhancedCleanup().catch(err => console.error('Cleanup failed:', err));
