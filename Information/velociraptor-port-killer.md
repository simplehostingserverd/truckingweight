# Velociraptor Port Killer

The Velociraptor Port Killer is an extremely aggressive process termination tool designed to ensure that ports (especially port 3000) are freed up before starting the application. It's named after the clever and relentless predator from Jurassic Park, as it hunts down and eliminates processes with extreme prejudice.

## Overview

This tool is specifically designed to solve the persistent issue of processes remaining on port 3000 even after the application has been stopped. It uses multiple strategies and escalating levels of force to ensure that all required ports are free before the application starts.

## Features

- **Critical Port Prioritization**: Special focus on port 3000 with extra retries and more aggressive methods
- **Multiple Process Detection Methods**: Uses both `lsof` and `netstat` to find processes using ports
- **Escalating Force Levels**: Starts with normal termination and escalates to more aggressive methods
- **System-Wide Cleanup**: For stubborn processes on critical ports, can use system-wide cleanup methods
- **Detailed Reporting**: Provides clear feedback on what's happening and what ports are being cleared

## Usage

You can run the Velociraptor Port Killer in several ways:

### Direct Execution

```bash
npm run velociraptor-port-killer
```

### As Part of Application Startup

The tool is automatically run as part of the `predev` script, so it will execute before the application starts:

```bash
npm run dev
```

### For Specific Port Issues

If you're having issues specifically with port 3000, you can run:

```bash
node scripts/velociraptor.js
```

## How It Works

1. **Process Pattern Hunting**: First, it searches for processes matching specific patterns (Next.js, Node.js, etc.)
2. **Critical Port Clearing**: It then focuses on clearing critical ports (port 3000)
3. **Regular Port Clearing**: After critical ports are clear, it moves on to other required ports
4. **Verification**: It verifies that ports are actually free after termination attempts
5. **Escalation**: For stubborn processes, especially on critical ports, it escalates to more aggressive methods

## Aggressive Methods

The Velociraptor Port Killer employs several increasingly aggressive methods to free ports:

1. **Standard Kill**: Uses `kill -9` to terminate processes
2. **Sudo Kill**: Attempts to use sudo for more forceful termination (may prompt for password)
3. **Parent Process Kill**: Tries to kill parent processes with `pkill -KILL -P`
4. **Pattern Killing**: Uses `pkill -9 -f` to kill processes matching specific patterns
5. **Port Unbinding**: Uses `fuser -k -n tcp` to forcibly unbind ports
6. **System-Wide Node.js Termination**: As a last resort, can terminate all Node.js processes

## Configuration

The tool is configured with several parameters that control its behavior:

- `PORTS_TO_CLEAR`: List of all ports that need to be cleared
- `CRITICAL_PORTS`: List of ports that are considered critical (gets special treatment)
- `PROCESS_PATTERNS`: Patterns to match when hunting for processes
- `MAX_RETRIES`: Number of attempts to clear regular ports
- `CRITICAL_MAX_RETRIES`: Number of attempts to clear critical ports
- `RETRY_DELAY_MS`: Delay between retry attempts

## When to Use

Use the Velociraptor Port Killer when:

1. You're experiencing "port already in use" errors when starting the application
2. The application didn't shut down properly in a previous run
3. You have zombie processes that won't terminate normally
4. You need to ensure a clean environment before starting the application

## Troubleshooting

If the Velociraptor Port Killer cannot clear a critical port after multiple attempts:

1. Try running it with sudo: `sudo node scripts/velociraptor.js`
2. Manually identify and kill the process: `sudo lsof -i :3000 -t | xargs sudo kill -9`
3. As a last resort, restart your system

## Warning

The Velociraptor Port Killer is intentionally aggressive and will terminate processes without confirmation. Use with caution in environments where you have other important Node.js processes running that you don't want to terminate.

## Customization

If you need to customize the behavior of the Velociraptor Port Killer, you can modify the configuration variables at the top of the `scripts/velociraptor.js` file:

```javascript
// Configuration
const PORTS_TO_CLEAR = [3000, 3001, 3002, 3003, 3004, 3005, 5000];
const CRITICAL_PORTS = [3000]; // Special focus on these ports
const PROCESS_PATTERNS = [
  'next dev',
  'node server-fastify.js',
  'nodemon server-fastify.js',
  'truckingsemis-frontend',
  'truckingsemis-backend',
  'node',  // More aggressive - will catch any node process
  'npm',   // Even more aggressive - will catch npm processes
];
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 500;
const CRITICAL_MAX_RETRIES = 10;
```

## Conclusion

The Velociraptor Port Killer is a powerful tool for ensuring that your application can start cleanly without port conflicts. It's especially useful in development environments where processes may not always terminate properly. Use it when you need to ensure that critical ports like 3000 are free before starting your application.

Remember: Like its namesake, the Velociraptor Port Killer is relentless, clever, and extremely effective at hunting down its prey - stubborn processes that refuse to release your ports!
