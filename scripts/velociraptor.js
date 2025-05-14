/**
 * Velociraptor Port Cleaner
 * 
 * This script aggressively hunts down and terminates any processes
 * using the ports required by our application.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { setTimeout } from 'timers/promises';

const execAsync = promisify(exec);

// Configuration
const PORTS_TO_CLEAR = [3000, 3001, 3002, 5000];
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
    
    console.log(`${colors.red}Port ${port} is in use by process ${pid}. Terminating...${colors.reset}`);
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
  
  console.error(`${colors.red}Failed to clear port ${port} after ${MAX_RETRIES} attempts.${colors.reset}`);
  return false;
}

/**
 * Clear all required ports
 */
async function clearAllPorts() {
  console.log(`\n${colors.cyan}🦖 Velociraptor Port Cleaner 🦖${colors.reset}`);
  console.log(`${colors.cyan}Hunting down processes on ports: ${PORTS_TO_CLEAR.join(', ')}${colors.reset}\n`);
  
  let allClear = true;
  
  for (const port of PORTS_TO_CLEAR) {
    const cleared = await clearPort(port);
    if (!cleared) {
      allClear = false;
    }
  }
  
  if (allClear) {
    console.log(`\n${colors.green}🦖 All ports successfully cleared! Ready to proceed.${colors.reset}`);
  } else {
    console.error(`\n${colors.red}⚠️ Some ports could not be cleared. There may be issues starting the application.${colors.reset}`);
  }
  
  return allClear;
}

// Run the port cleaner
clearAllPorts()
  .then(success => {
    if (!success) {
      process.exit(1); // Exit with error code if not all ports were cleared
    }
  })
  .catch(error => {
    console.error(`${colors.red}Error running port cleaner:${colors.reset}`, error);
    process.exit(1);
  });
