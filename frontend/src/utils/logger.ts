/**
 * Logger utility for consistent logging across the application
 * Supports different log levels and environments
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  context?: string;
}

// Maximum number of logs to keep in memory
const MAX_MEMORY_LOGS = 1000;

// In-memory log storage for debugging and potential submission to server
const memoryLogs: LogEntry[] = [];

// Environment detection
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Default minimum log level based on environment
const DEFAULT_MIN_LEVEL: LogLevel = isProduction ? 'warn' : 'debug';

// Current minimum log level
let minLogLevel: LogLevel = DEFAULT_MIN_LEVEL;

/**
 * Set the minimum log level
 * @param level - The minimum log level to display
 */
export function setLogLevel(level: LogLevel): void {
  minLogLevel = level;
}

/**
 * Get the current log level
 * @returns The current minimum log level
 */
export function getLogLevel(): LogLevel {
  return minLogLevel;
}

/**
 * Check if a log level should be displayed
 * @param level - The log level to check
 * @returns Whether the log level should be displayed
 */
function shouldLog(level: LogLevel): boolean {
  const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
  const minIndex = levels.indexOf(minLogLevel);
  const levelIndex = levels.indexOf(level);
  return levelIndex >= minIndex;
}

/**
 * Format data for logging
 * @param data - The data to format
 * @returns Formatted data string
 */
function formatData(data: any): string {
  try {
    if (typeof data === 'object') {
      return JSON.stringify(data, null, 2);
    }
    return String(data);
  } catch (error) {
    return '[Unserializable data]';
  }
}

/**
 * Add a log entry to memory storage
 * @param entry - The log entry to add
 */
function addToMemoryLogs(entry: LogEntry): void {
  memoryLogs.push(entry);
  
  // Keep memory logs under the maximum size
  if (memoryLogs.length > MAX_MEMORY_LOGS) {
    memoryLogs.shift();
  }
}

/**
 * Create a log entry
 * @param level - Log level
 * @param message - Log message
 * @param data - Optional data to log
 * @param context - Optional context (e.g., component name)
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  data?: any,
  context?: string
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    data,
    context,
  };
}

/**
 * Log a message at the specified level
 * @param level - Log level
 * @param message - Log message
 * @param data - Optional data to log
 * @param context - Optional context (e.g., component name)
 */
function log(
  level: LogLevel,
  message: string,
  data?: any,
  context?: string
): void {
  if (!shouldLog(level)) {
    return;
  }

  const entry = createLogEntry(level, message, data, context);
  addToMemoryLogs(entry);

  // Format console output
  const prefix = `[${entry.timestamp.split('T')[1].split('.')[0]}] ${level.toUpperCase()}${
    context ? ` [${context}]` : ''
  }:`;

  // Log to console with appropriate method
  switch (level) {
    case 'debug':
      console.debug(prefix, message, data !== undefined ? data : '');
      break;
    case 'info':
      console.info(prefix, message, data !== undefined ? data : '');
      break;
    case 'warn':
      console.warn(prefix, message, data !== undefined ? data : '');
      break;
    case 'error':
      console.error(prefix, message, data !== undefined ? data : '');
      break;
  }
}

/**
 * Get all logs stored in memory
 * @returns Array of log entries
 */
export function getLogs(): LogEntry[] {
  return [...memoryLogs];
}

/**
 * Clear all logs from memory
 */
export function clearLogs(): void {
  memoryLogs.length = 0;
}

/**
 * Export logs as JSON
 * @returns JSON string of logs
 */
export function exportLogs(): string {
  return JSON.stringify(memoryLogs, null, 2);
}

// Public logging methods
export const logger = {
  debug: (message: string, data?: any, context?: string) =>
    log('debug', message, data, context),
  info: (message: string, data?: any, context?: string) =>
    log('info', message, data, context),
  warn: (message: string, data?: any, context?: string) =>
    log('warn', message, data, context),
  error: (message: string, data?: any, context?: string) =>
    log('error', message, data, context),
  getLogs,
  clearLogs,
  exportLogs,
  setLogLevel,
  getLogLevel,
};

export default logger;
