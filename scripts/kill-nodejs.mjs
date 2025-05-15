/**
 * Node.js Process Killer
 *
 * This script finds and terminates all Node.js processes except itself
 * and essential VS Code processes. It's designed to be run before starting
 * the application to ensure no lingering Node.js processes cause port conflicts.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { setTimeout } from 'timers/promises';

const execAsync = promisify(exec);

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

// Patterns for processes to exclude from killing
const EXCLUDE_PATTERNS = [
  'kill-nodejs.js',
  'vscode',
  '.vscode',
  'code',
  'desktop-commander'
];

/**
 * Find all Node.js processes
 * @returns {Promise<Array<{pid: string, command: string}>>} - List of Node.js processes
 */
async function findNodeProcesses() {
  try {
    // Get current process ID to exclude it from killing
    const currentPid = process.pid.toString();
    
    // Get a list of all Node.js processes
    const { stdout } = await execAsync('ps aux | grep node');
    
    // Parse the output to find PIDs
    const lines = stdout.split('\n');
    const nodeProcesses = [];
    
    for (const line of lines) {
      // Skip grep process itself and empty lines
      if (line.includes('grep node') || !line.trim()) {
        continue;
      }
      
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2) {
        const pid = parts[1];
        
        // Skip the current process and its parent
        if (
          pid &&
          !isNaN(parseInt(pid)) &&
          pid !== currentPid &&
          pid !== process.ppid?.toString()
        ) {
          // Check if this process should be excluded
          const shouldExclude = EXCLUDE_PATTERNS.some(pattern => line.includes(pattern));
          
          if (!shouldExclude) {
            nodeProcesses.push({
              pid,
              command: line
            });
          }
        }
      }
    }
    
    return nodeProcesses;
  } catch (error) {
    console.error(`${colors.red}Error finding Node.js processes:${colors.reset}`, error.message);
    return [];
  }
}

/**
 * Kill a process by PID
 * @param {string} pid - The process ID to kill
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
 * Kill all Node.js processes except excluded ones
 */
async function killAllNodeProcesses() {
  console.log(`\n${colors.cyan}🔪 Node.js Process Killer 🔪${colors.reset}`);
  console.log(`${colors.cyan}Finding and terminating all Node.js processes...${colors.reset}\n`);
  
  // Find all Node.js processes
  const nodeProcesses = await findNodeProcesses();
  
  if (nodeProcesses.length === 0) {
    console.log(`${colors.green}No Node.js processes found to terminate.${colors.reset}`);
    return true;
  }
  
  console.log(`${colors.yellow}Found ${nodeProcesses.length} Node.js processes to terminate:${colors.reset}`);
  
  // Kill each process
  let killedCount = 0;
  for (const process of nodeProcesses) {
    console.log(`${colors.yellow}Terminating process ${process.pid}:${colors.reset}`);
    console.log(`${colors.white}${process.command.substring(0, 100)}...${colors.reset}`);
    
    const killed = await killProcess(process.pid);
    if (killed) {
      killedCount++;
    }
  }
  
  if (killedCount > 0) {
    console.log(`${colors.green}Successfully terminated ${killedCount} Node.js processes.${colors.reset}`);
    // Wait a moment for processes to fully terminate
    await setTimeout(1000);
  }
  
  // Verify all processes were killed
  const remainingProcesses = await findNodeProcesses();
  if (remainingProcesses.length > 0) {
    console.log(`${colors.yellow}There are still ${remainingProcesses.length} Node.js processes running.${colors.reset}`);
    console.log(`${colors.yellow}These may be essential processes or they couldn't be terminated.${colors.reset}`);
    return false;
  } else {
    console.log(`${colors.green}All targeted Node.js processes have been terminated.${colors.reset}`);
    return true;
  }
}

// Run the Node.js process killer
killAllNodeProcesses()
  .then(success => {
    if (!success) {
      console.log(`${colors.yellow}Some processes could not be terminated, but we'll continue anyway.${colors.reset}`);
    }
    console.log(`${colors.green}Node.js process cleanup completed.${colors.reset}`);
  })
  .catch(error => {
    console.error(`${colors.red}Error running Node.js process killer:${colors.reset}`, error);
    process.exit(1);
  });
