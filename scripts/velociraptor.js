/**
 * Velociraptor Process Hunter
 *
 * This script aggressively hunts down and terminates any processes
 * related to our application, including those using specific ports
 * and those matching specific process names.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { setTimeout } from 'timers/promises';

const execAsync = promisify(exec);

// Configuration
const PORTS_TO_CLEAR = [3000, 3001, 3002, 3003, 3004, 3005, 5000];
const PROCESS_PATTERNS = [
  'next dev',
  'node server-fastify.js',
  'nodemon server-fastify.js',
  'truckingsemis-frontend',
  'truckingsemis-backend',
];
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

/**
 * Find the process using a specific port
 * @param {number} port - The port to check
 * @returns {Promise<number|null>} - The PID of the process using the port, or null if none
 */
async function findProcessUsingPort(port) {
  try {
    const { stdout } = await execAsync(`lsof -i :${port} -t`);
    const pid = stdout.trim();
    return pid ? parseInt(pid, 10) : null;
  } catch (error) {
    // lsof returns non-zero exit code if no process is found
    return null;
  }
}

/**
 * Kill a process by PID
 * @param {number} pid - The process ID to kill
 * @returns {Promise<boolean>} - Whether the kill was successful
 */
async function killProcess(pid) {
  try {
    await execAsync(`kill -9 ${pid}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}Failed to kill process ${pid}:${colors.reset}`, error.message);
    return false;
  }
}

/**
 * Clear a specific port
 * @param {number} port - The port to clear
 * @returns {Promise<boolean>} - Whether the port was successfully cleared
 */
async function clearPort(port) {
  console.log(`${colors.yellow}Checking port ${port}...${colors.reset}`);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const pid = await findProcessUsingPort(port);

    if (!pid) {
      console.log(`${colors.green}Port ${port} is free.${colors.reset}`);
      return true;
    }

    console.log(
      `${colors.red}Port ${port} is in use by process ${pid}. Terminating...${colors.reset}`
    );
    const killed = await killProcess(pid);

    if (killed) {
      console.log(`${colors.green}Successfully terminated process ${pid}.${colors.reset}`);

      // Wait a moment for the port to be released
      await setTimeout(500);

      // Verify the port is now free
      const stillRunning = await findProcessUsingPort(port);
      if (!stillRunning) {
        console.log(`${colors.green}Port ${port} is now free.${colors.reset}`);
        return true;
      }
    }

    if (attempt < MAX_RETRIES) {
      console.log(`${colors.yellow}Retrying (${attempt}/${MAX_RETRIES})...${colors.reset}`);
      await setTimeout(RETRY_DELAY_MS);
    }
  }

  console.error(
    `${colors.red}Failed to clear port ${port} after ${MAX_RETRIES} attempts.${colors.reset}`
  );
  return false;
}

/**
 * Find and kill processes matching specific patterns
 */
async function findAndKillProcessesByPattern() {
  console.log(`${colors.yellow}Hunting processes by pattern...${colors.reset}`);

  try {
    // Get current process ID to exclude it from killing
    const currentPid = process.pid.toString();

    // Get a list of all processes
    const { stdout } = await execAsync('ps aux');
    const lines = stdout.split('\n');
    const pidsByPattern = {};
    const allPids = [];

    // Find PIDs for each pattern
    for (const pattern of PROCESS_PATTERNS) {
      pidsByPattern[pattern] = [];

      for (const line of lines) {
        if (line.includes(pattern)) {
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
        console.log(
          `${colors.red}Found ${pids.length} processes matching "${pattern}": ${pids.join(', ')}${colors.reset}`
        );

        for (const pid of pids) {
          await killProcess(pid);
          killedCount++;
        }
      }
    }

    if (killedCount > 0) {
      console.log(`${colors.green}Terminated ${killedCount} processes by pattern.${colors.reset}`);
      // Wait a moment for processes to fully terminate
      await setTimeout(1000);
    } else {
      console.log(`${colors.green}No matching processes found by pattern.${colors.reset}`);
    }

    return true;
  } catch (error) {
    console.error(`${colors.red}Error finding processes by pattern:${colors.reset}`, error.message);
    return false;
  }
}

/**
 * Clear all required ports and kill all matching processes
 */
async function huntAndKill() {
  console.log(`\n${colors.cyan}🦖 Velociraptor Process Hunter 🦖${colors.reset}`);
  console.log(
    `${colors.cyan}Hunting down application processes and freeing ports: ${PORTS_TO_CLEAR.join(', ')}${colors.reset}\n`
  );

  // First, kill processes by pattern
  await findAndKillProcessesByPattern();

  // Then clear ports
  let allClear = true;
  for (const port of PORTS_TO_CLEAR) {
    const cleared = await clearPort(port);
    if (!cleared) {
      allClear = false;
    }
  }

  if (allClear) {
    console.log(
      `\n${colors.green}🦖 All processes terminated and ports cleared! Ready to proceed.${colors.reset}`
    );
  } else {
    console.error(
      `\n${colors.red}⚠️ Some ports could not be cleared. There may be issues starting the application.${colors.reset}`
    );
  }

  return allClear;
}

// Run the process hunter and port cleaner
huntAndKill()
  .then(success => {
    if (!success) {
      process.exit(1); // Exit with error code if not all processes were terminated or ports were cleared
    }
  })
  .catch(error => {
    console.error(`${colors.red}Error running process hunter:${colors.reset}`, error);
    process.exit(1);
  });
