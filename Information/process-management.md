# Process Management Guide

## Overview

This document explains how process management works in the Trucking Weight Management System and how to handle process-related issues.

## Starting the Application

To start the application, use the following command from the project root:

```bash
npm run dev
```

This command uses `concurrently` to start both the frontend and backend services simultaneously. The configuration has been updated to ensure proper process management.

## Process Management Improvements

The following improvements have been made to ensure proper process management:

1. **Kill-Others Options**: The `concurrently` command now includes the `--kill-others-on-fail` and `--kill-others` options, which ensure that if one process fails or is terminated, all other processes are also terminated.

2. **Cleanup Script**: A cleanup script has been added at `scripts/cleanup.js` that finds and terminates any lingering processes related to the application.

3. **Velociraptor Port Cleaner**: An aggressive port-clearing script has been added at `scripts/velociraptor.js` that hunts down and terminates any processes using the ports required by the application (3000-3002 for frontend, 5000 for backend).

4. **Pre/Post Hooks**: The `predev` and `postdev` npm scripts have been added to run the cleanup and velociraptor scripts before starting and the cleanup script after stopping the application.

## Troubleshooting

If you encounter issues with processes not terminating properly or ports being in use, you can manually run the cleanup and velociraptor scripts:

```bash
# To clean up lingering application processes
npm run cleanup

# To aggressively clear ports needed by the application
npm run velociraptor
```

### Common Issues

#### Port Already in Use

If you see an error like `listen EADDRINUSE: address already in use 0.0.0.0:5000`, it means there's already a process using port 5000. This can happen if:

1. The application didn't shut down properly
2. Another application is using the port
3. A previous instance of the application is still running

To resolve this:

1. Run the cleanup script: `npm run cleanup`
2. Run the velociraptor script: `npm run velociraptor`
3. If that doesn't work, manually find and kill the process:

   ```bash
   lsof -i :5000
   kill -9 <PID>
   ```

#### Multiple Next.js Instances

If you see warnings like `Port 3000 is in use, trying 3001 instead`, it means multiple Next.js instances are running. This can happen if:

1. The application didn't shut down properly
2. You're running multiple instances of the application

To resolve this:

1. Run the cleanup script: `npm run cleanup`
2. Run the velociraptor script: `npm run velociraptor`
3. If that doesn't work, manually find and kill the processes:

   ```bash
   ps aux | grep next
   kill -9 <PID>
   ```

## Best Practices

1. **Always use npm run dev**: Start the application using `npm run dev` from the project root, not by starting the frontend and backend separately.

2. **Use Ctrl+C to stop**: When stopping the application, use Ctrl+C in the terminal where it's running. This allows the cleanup processes to run properly.

3. **Let the velociraptor handle port conflicts**: The velociraptor script automatically runs before starting the application and will clear any processes using the required ports.

4. **Check for lingering processes**: If you're experiencing issues, check for lingering processes using `ps aux | grep node` or `lsof -i :5000`.

5. **Run cleanup and velociraptor manually when needed**: If you suspect there are lingering processes or port conflicts, run:

   ```bash
   npm run cleanup
   npm run velociraptor
   ```
