/**
 * Velociraptor Port Killer
 *
 * This script EXTREMELY aggressively hunts down and terminates any processes
 * related to our application, including those using specific ports
 * and those matching specific process names.
 *
 * Special focus on port 3000 - nothing escapes the Velociraptor!
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { setTimeout } from 'timers/promises';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PORTS_TO_CLEAR = [3000, 3001, 3002, 3003, 3004, 3005, 5000];
const CRITICAL_PORTS = [3000]; // Special focus on these ports - will be more aggressive
const PROCESS_PATTERNS = [
  'next dev',
  'node server-fastify.js',
  'nodemon server-fastify.js',
  'truckingsemis-frontend',
  'truckingsemis-backend',
];
// Processes to exclude from killing (important system processes)
const EXCLUDE_PATTERNS = [
  'vscode',
  'code',
  '.vscode',
  'desktop-commander',
  'code-server',
  'code-oss',
  'vscodium',
  'atom',
  'sublime',
  'webstorm',
  'intellij',
  'pycharm',
  'phpstorm',
  'rubymine',
  'rider',
  'goland',
  'clion',
  'datagrip',
  'idea',
  'eclipse',
  'netbeans',
  'android studio',
  'xcode',
  'vim',
  'emacs',
  'nano',
  'ssh',
  'terminal',
  'bash',
  'zsh',
  'fish',
  'powershell',
  'cmd',
  'explorer',
  'finder',
  'nautilus',
  'dolphin',
  'thunar',
  'pcmanfm',
  'nemo',
  'caja',
  'konqueror',
  'chrome',
  'firefox',
  'safari',
  'edge',
  'opera',
  'brave',
  'vivaldi',
  'slack',
  'discord',
  'teams',
  'zoom',
  'skype',
  'telegram',
  'whatsapp',
  'signal',
  'spotify',
  'itunes',
  'vlc',
  'mpv',
  'mplayer',
  'totem',
  'kodi',
  'plex',
  'systemd',
  'init',
  'launchd',
  'svchost',
  'services',
  'winlogon',
  'lsass',
  'csrss',
  'wininit',
  'logind',
  'dbus',
  'NetworkManager',
  'pulseaudio',
  'pipewire',
  'Xorg',
  'wayland',
  'gnome-shell',
  'plasma',
  'xfce',
  'mate',
  'cinnamon',
  'budgie',
  'i3',
  'sway',
  'awesome',
  'openbox',
  'fluxbox',
  'bspwm',
  'dwm',
  'xmonad',
  'velociraptor-port-killer',
  'kill-nodejs',
];
const MAX_RETRIES = 3; // Reduced to be less aggressive
const RETRY_DELAY_MS = 500; // Decreased from 1000
const CRITICAL_MAX_RETRIES = 5; // Reduced to be less aggressive

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
 * Find all processes using a specific port
 * @param {number} port - The port to check
 * @returns {Promise<number[]>} - Array of PIDs using the port, or empty array if none
 */
async function findProcessesUsingPort(port) {
  try {
    // Try lsof first (most common)
    const { stdout } = await execAsync(`lsof -i :${port} -t`);
    const pids = stdout
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(pid => parseInt(pid, 10));

    if (pids.length > 0) {
      return pids;
    }

    // If lsof didn't find anything, try netstat as backup
    try {
      const { stdout: netstatOutput } = await execAsync(
        `netstat -tulpn 2>/dev/null | grep :${port}`
      );
      const netstatPids = [];

      netstatOutput
        .split('\n')
        .filter(Boolean)
        .forEach(line => {
          const match = line.match(/LISTEN\s+(\d+)/);
          if (match && match[1]) {
            netstatPids.push(parseInt(match[1], 10));
          }
        });

      return netstatPids;
    } catch (netstatError) {
      // Netstat failed or found nothing
      return [];
    }
  } catch (error) {
    // lsof returns non-zero exit code if no process is found
    return [];
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
 * Clear a specific port with extreme prejudice
 * @param {number} port - The port to clear
 * @returns {Promise<boolean>} - Whether the port was successfully cleared
 */
async function clearPort(port) {
  const isCritical = CRITICAL_PORTS.includes(port);
  const maxAttempts = isCritical ? CRITICAL_MAX_RETRIES : MAX_RETRIES;

  console.log(
    `${colors.yellow}Checking port ${port}...${isCritical ? colors.red + ' [CRITICAL PORT]' : ''}${colors.reset}`
  );

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const pids = await findProcessesUsingPort(port);

    if (pids.length === 0) {
      console.log(`${colors.green}Port ${port} is free.${colors.reset}`);
      return true;
    }

    console.log(
      `${colors.red}Port ${port} is in use by ${pids.length} process(es): ${pids.join(', ')}. Terminating...${colors.reset}`
    );

    // Kill all processes using this port
    let allKilled = true;
    for (const pid of pids) {
      const killed = await killProcess(pid);
      if (!killed) {
        allKilled = false;

        // For critical ports, try more aggressive methods if normal kill fails
        if (isCritical) {
          console.log(
            `${colors.red}Critical port ${port}: Normal kill failed for PID ${pid}. Trying force kill...${colors.reset}`
          );
          try {
            // Try with sudo if available (might prompt for password)
            await execAsync(`sudo kill -9 ${pid}`).catch(() => {
              // If sudo fails, try other aggressive methods
              return execAsync(`pkill -KILL -P ${pid}`);
            });
          } catch (error) {
            console.error(`${colors.red}Force kill also failed for PID ${pid}.${colors.reset}`);
          }
        }
      }
    }

    // Wait a moment for the port to be released
    await setTimeout(RETRY_DELAY_MS);

    // Verify the port is now free
    const stillRunningPids = await findProcessesUsingPort(port);
    if (stillRunningPids.length === 0) {
      console.log(`${colors.green}Port ${port} is now free.${colors.reset}`);
      return true;
    }

    // For critical ports, try more targeted methods
    if (isCritical && attempt > MAX_RETRIES) {
      console.log(
        `${colors.red}CRITICAL PORT ${port} STILL IN USE! Trying targeted methods...${colors.reset}`
      );

      try {
        // Try to kill processes related to the application on this port, but not system processes
        await execAsync(
          `lsof -i :${port} -t | xargs -r ps -p | grep -v "${EXCLUDE_PATTERNS.join('\\|')}" | awk '{print $1}' | xargs -r kill -9`
        ).catch(() => {});

        // Try to kill processes with the port in their command line, but not system processes
        await execAsync(
          `ps aux | grep "${port}" | grep -v "${EXCLUDE_PATTERNS.join('\\|')}" | awk '{print $2}' | xargs -r kill -9`
        ).catch(() => {});

        // For Linux, try to forcibly unbind the port using fuser, but more carefully
        await execAsync(`fuser -k -n tcp ${port}`).catch(() => {});
      } catch (error) {
        // Ignore errors from these commands
      }

      // Wait a bit longer after these methods
      await setTimeout(1000);
    }

    if (attempt < maxAttempts) {
      console.log(`${colors.yellow}Retrying (${attempt}/${maxAttempts})...${colors.reset}`);
    }
  }

  // Last resort for critical ports - warn the user they may need to reboot
  if (isCritical) {
    console.error(
      `${colors.red}⚠️ CRITICAL PORT ${port} COULD NOT BE CLEARED AFTER MULTIPLE ATTEMPTS!${colors.reset}\n` +
        `${colors.red}You may need to reboot your system to free this port.${colors.reset}\n` +
        `${colors.yellow}Try manually with: sudo lsof -i :${port} -t | xargs sudo kill -9${colors.reset}`
    );
  } else {
    console.error(
      `${colors.red}Failed to clear port ${port} after ${maxAttempts} attempts.${colors.reset}`
    );
  }

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
          // Check if the line contains any excluded patterns
          const shouldExclude = EXCLUDE_PATTERNS.some(excludePattern =>
            line.toLowerCase().includes(excludePattern.toLowerCase())
          );

          if (shouldExclude) {
            continue; // Skip this line if it matches an excluded pattern
          }

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
          console.log(`${colors.yellow}Terminating process ${pid}...${colors.reset}`);
          const killed = await killProcess(pid);
          if (killed) {
            killedCount++;
          }
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
 * Clear all required ports and kill all matching processes with extreme prejudice
 */
async function huntAndKill() {
  console.log(`\n${colors.red}🦖 Velociraptor Port Killer 🦖${colors.reset}`);
  console.log(
    `${colors.red}AGGRESSIVELY hunting down processes and freeing ports: ${PORTS_TO_CLEAR.join(', ')}${colors.reset}`
  );
  console.log(
    `${colors.red}Critical ports with extreme prejudice: ${CRITICAL_PORTS.join(', ')}${colors.reset}\n`
  );

  // First, kill processes by pattern
  await findAndKillProcessesByPattern();

  // First clear critical ports
  let criticalPortsClear = true;
  if (CRITICAL_PORTS.length > 0) {
    console.log(`${colors.red}🔥 PRIORITY: Clearing critical ports first...${colors.reset}`);

    for (const port of CRITICAL_PORTS) {
      const cleared = await clearPort(port);
      if (!cleared) {
        criticalPortsClear = false;
      }
    }
  }

  // Then clear remaining ports
  let allClear = criticalPortsClear;
  const remainingPorts = PORTS_TO_CLEAR.filter(port => !CRITICAL_PORTS.includes(port));

  if (remainingPorts.length > 0) {
    console.log(`${colors.yellow}Clearing remaining ports...${colors.reset}`);

    for (const port of remainingPorts) {
      const cleared = await clearPort(port);
      if (!cleared) {
        allClear = false;
      }
    }
  }

  // Double-check critical ports one more time
  if (!criticalPortsClear && CRITICAL_PORTS.length > 0) {
    console.log(`${colors.red}🔄 Double-checking critical ports one last time...${colors.reset}`);

    for (const port of CRITICAL_PORTS) {
      const pids = await findProcessesUsingPort(port);
      if (pids.length > 0) {
        console.log(
          `${colors.red}⚠️ CRITICAL PORT ${port} STILL HAS PROCESSES: ${pids.join(', ')}${colors.reset}`
        );

        // Last resort - try targeted methods
        try {
          console.log(
            `${colors.red}🔥 LAST RESORT: Using targeted methods for port ${port}...${colors.reset}`
          );

          // Get the command line for processes using this port
          const { stdout: cmdLines } = await execAsync(`lsof -i :${port} -F c`).catch(() => ({
            stdout: '',
          }));

          // Extract command names
          const cmdNames = cmdLines
            .split('\n')
            .filter(line => line.startsWith('c'))
            .map(line => line.substring(1));

          console.log(
            `${colors.yellow}Found commands using port ${port}: ${cmdNames.join(', ')}${colors.reset}`
          );

          // Kill only application-related processes, not system processes
          for (const cmd of cmdNames) {
            const shouldExclude = EXCLUDE_PATTERNS.some(pattern =>
              cmd.toLowerCase().includes(pattern.toLowerCase())
            );

            if (!shouldExclude) {
              console.log(`${colors.yellow}Attempting to kill command: ${cmd}${colors.reset}`);
              await execAsync(`pkill -9 -f "${cmd}"`).catch(() => {});
            } else {
              console.log(`${colors.green}Preserving system process: ${cmd}${colors.reset}`);
            }
          }

          // Try one more targeted approach for the port
          await execAsync(`fuser -k -n tcp ${port}`).catch(() => {});
        } catch (error) {
          // Ignore errors
        }
      } else {
        console.log(`${colors.green}✅ Critical port ${port} is now free.${colors.reset}`);
        criticalPortsClear = true;
      }
    }
  }

  if (allClear) {
    console.log(
      `\n${colors.green}🦖 All processes terminated and ports cleared! Ready to proceed.${colors.reset}`
    );
  } else if (criticalPortsClear) {
    console.log(
      `\n${colors.yellow}⚠️ Critical ports are clear, but some non-critical ports could not be cleared.${colors.reset}\n` +
        `${colors.green}The application should still be able to start.${colors.reset}`
    );
    // Return true if at least critical ports are clear
    return true;
  } else {
    console.error(
      `\n${colors.red}❌ CRITICAL PORTS COULD NOT BE CLEARED! The application will likely fail to start.${colors.reset}\n` +
        `${colors.yellow}You may need to restart your system to free these ports.${colors.reset}`
    );
  }

  return criticalPortsClear;
}

/**
 * Play a VERY LOUD dinosaur roar sound
 */
async function playDinosaurRoar() {
  console.log(`\n${colors.red}🦖 RAAAAWWWWRRRR!!! 🦖${colors.reset}`);

  // Create a very visible ASCII art
  const roarAsciiArt = `
${colors.red}
                     .-=-.          .--.
        __        .'     '.       /  " )
 _     / o)       |  o  o  |      /  .'
( \\_  /. /        \\  .--.  /      /  /
 \\_\\/___/          '----'       .'  /
 _/  _/           ______       /   /
/  _/            /      \\     |   /
\\/_/            /        \\    |  |
               /   .     \\   |  |
              /   /|      \\  | |
             /   / |       \\ | |
            /   /  |        \\| |
           /   /   |         | |
          /   /    |         | |
         /   /     |         | |
        /   /      |         | |
       /___/       |_________| |
                   |_________|/

🦖🦖🦖 RAAAAWWWWRRRR!!! 🦖🦖🦖
VELOCIRAPTOR PORT KILLER HAS TERMINATED ALL PROCESSES!
🦖🦖🦖 RAAAAWWWWRRRR!!! 🦖🦖🦖
${colors.reset}
  `;

  // Print the ASCII art to console
  console.log(roarAsciiArt);

  try {
    // Check if velociraptor sound file exists
    const soundFilePath = path.join(__dirname, 'velociraptor-roar.mp3');
    let soundFileExists = false;

    try {
      fs.accessSync(soundFilePath, fs.constants.F_OK);
      soundFileExists = true;
    } catch (err) {
      // Sound file doesn't exist, will use fallbacks
    }

    // Different approaches based on the operating system
    const platform = process.platform;

    if (platform === 'darwin') {
      // macOS - try to play the velociraptor sound if it exists
      if (soundFileExists) {
        await execAsync(`afplay "${soundFilePath}" && afplay "${soundFilePath}"`).catch(() => {});
      }

      // Use system beep multiple times for maximum volume as fallback
      for (let i = 0; i < 5; i++) {
        await execAsync('osascript -e "beep 3"').catch(() => {});
      }

      // Use text-to-speech for the roar
      await execAsync(
        'say -v Daniel -r 30 -v 100 "RAAAAWWWRRRR! Velociraptor Port Killer has terminated all processes!" &'
      ).catch(() => {});
    } else if (platform === 'win32') {
      // Windows - try to play the velociraptor sound if it exists
      if (soundFileExists) {
        await execAsync(
          `powershell -c "(New-Object Media.SoundPlayer '${soundFilePath}').PlaySync(); (New-Object Media.SoundPlayer '${soundFilePath}').PlaySync()"`
        ).catch(() => {});
      }

      // Use multiple system beeps and text-to-speech as fallback
      for (let i = 0; i < 5; i++) {
        await execAsync(
          'powershell -c "[console]::beep(500,300); [console]::beep(400,300); [console]::beep(650,300)"'
        ).catch(() => {});
      }

      // Use text-to-speech for the roar
      await execAsync(
        'powershell -c "Add-Type -AssemblyName System.Speech; $speak = New-Object System.Speech.Synthesis.SpeechSynthesizer; $speak.Volume = 100; $speak.Rate = 2; $speak.Speak(\'RAAAAWWWRRRR! Velociraptor Port Killer has terminated all processes!\')" &'
      ).catch(() => {});
    } else {
      // Linux - try to play the velociraptor sound if it exists
      if (soundFileExists) {
        await execAsync(
          `(mpg123 "${soundFilePath}" || ffplay -nodisp -autoexit "${soundFilePath}" || mplayer "${soundFilePath}") 2>/dev/null`
        ).catch(() => {});
        await execAsync(
          `(mpg123 "${soundFilePath}" || ffplay -nodisp -autoexit "${soundFilePath}" || mplayer "${soundFilePath}") 2>/dev/null`
        ).catch(() => {});
      }

      // Try multiple sound approaches as fallback
      const commands = [
        'paplay /usr/share/sounds/freedesktop/stereo/bell.oga',
        'aplay /usr/share/sounds/alsa/Front_Center.wav',
        'spd-say -r 30 -p 100 -t female3 "RAAAAWWWRRRR! Velociraptor Port Killer has terminated all processes!"',
        'beep -f 300 -l 100 -r 3 -n -f 200 -l 100 -r 2 -n -f 500 -l 100 -r 5',
        'echo -e "\\a\\a\\a\\a\\a"', // Terminal bell as last resort
      ];

      // Try each command, continue if one fails
      for (const cmd of commands) {
        try {
          await execAsync(cmd);
        } catch (e) {
          // Continue to next command if this one fails
          continue;
        }
      }
    }

    // Use terminal bell character multiple times as a fallback that works everywhere
    process.stdout.write('\u0007\u0007\u0007\u0007\u0007');

    // Print a message to console as confirmation
    console.log(
      `${colors.red}🦖 VELOCIRAPTOR PORT KILLER HAS TERMINATED ALL PROCESSES! 🦖${colors.reset}`
    );
  } catch (error) {
    // Fallback if all sound playing methods fail
    console.log(`\n${colors.red}
🦖🦖🦖 RAAAAWWWWRRRR!!! 🦖🦖🦖
VELOCIRAPTOR PORT KILLER HAS TERMINATED ALL PROCESSES!
🦖🦖🦖 RAAAAWWWWRRRR!!! 🦖🦖🦖
${colors.reset}\n`);

    // Last resort - use terminal bell character multiple times
    process.stdout.write('\u0007\u0007\u0007\u0007\u0007');
  }
}

// Run the process hunter and port cleaner
huntAndKill()
  .then(async success => {
    // Play dinosaur roar sound regardless of success
    await playDinosaurRoar();

    if (!success) {
      process.exit(1); // Exit with error code if not all processes were terminated or ports were cleared
    }
  })
  .catch(error => {
    console.error(`${colors.red}Error running process hunter:${colors.reset}`, error);
    process.exit(1);
  });
