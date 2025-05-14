/**
 * Cleanup script to ensure all processes are properly terminated
 * when the application is stopped.
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Function to find and kill processes
async function findAndKillProcesses(searchTerms) {
  try {
    // Get a list of all processes
    const { stdout } = await execAsync('ps aux');
    
    // Parse the output to find PIDs
    const lines = stdout.split('\n');
    const pids = [];
    
    for (const line of lines) {
      // Check if the line contains any of the search terms
      const matchesAnyTerm = searchTerms.some(term => line.includes(term));
      
      if (matchesAnyTerm) {
        // Extract the PID (second column in ps aux output)
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 2) {
          const pid = parts[1];
          if (pid && !isNaN(parseInt(pid))) {
            pids.push(pid);
          }
        }
      }
    }
    
    // Kill the processes
    if (pids.length > 0) {
      console.log(`Killing processes: ${pids.join(', ')}`);
      await execAsync(`kill -9 ${pids.join(' ')}`);
      console.log('Processes terminated successfully');
    } else {
      console.log('No matching processes found');
    }
  } catch (error) {
    console.error('Error cleaning up processes:', error);
  }
}

// Terms to search for in the process list
const searchTerms = [
  'server-fastify.js',
  'next dev',
  'nodemon server-fastify'
];

// Run the cleanup
findAndKillProcesses(searchTerms)
  .then(() => console.log('Cleanup completed'))
  .catch(err => console.error('Cleanup failed:', err));
