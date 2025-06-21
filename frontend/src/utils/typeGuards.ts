/**
 * TypeScript Type Guards and Utility Functions
 * Based on best practices for type safety and proper error handling
 */

// ============================================================================
// Basic Type Guards
// ============================================================================

/**
 * Type guard to check if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard to check if a value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard to check if a value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Type guard to check if a value is an object (not null, not array)
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Type guard to check if a value is an array
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Type guard to check if a value is null or undefined
 */
export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Type guard to check if a value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

// ============================================================================
// Error Handling Type Guards
// ============================================================================

/**
 * Type guard to check if a value is an Error instance
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Type guard to check if a value has an error-like structure
 */
export function isErrorLike(value: unknown): value is { message: string; name?: string } {
  return isObject(value) && isString(value.message);
}

/**
 * Safely extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  if (isErrorLike(error)) {
    return error.message;
  }
  if (isString(error)) {
    return error;
  }
  return 'An unknown error occurred';
}

/**
 * Safely extract error name from unknown error
 */
export function getErrorName(error: unknown): string {
  if (isError(error)) {
    return error.name;
  }
  if (isObject(error) && isString(error.name)) {
    return error.name;
  }
  return 'Error';
}

// ============================================================================
// API Response Type Guards
// ============================================================================

/**
 * Type guard for API response with data property
 */
export function isApiResponse<T>(
  value: unknown,
  dataValidator: (data: unknown) => data is T
): value is { data: T; success: boolean } {
  return (
    isObject(value) &&
    isBoolean(value.success) &&
    'data' in value &&
    dataValidator(value.data)
  );
}

/**
 * Type guard for paginated API response
 */
export function isPaginatedResponse<T>(
  value: unknown,
  itemValidator: (item: unknown) => item is T
): value is {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} {
  return (
    isObject(value) &&
    isArray(value.data) &&
    value.data.every(itemValidator) &&
    isObject(value.pagination) &&
    isNumber(value.pagination.page) &&
    isNumber(value.pagination.limit) &&
    isNumber(value.pagination.total) &&
    isNumber(value.pagination.totalPages)
  );
}

// ============================================================================
// Domain-Specific Type Guards
// ============================================================================

/**
 * Type guard for User object
 */
export interface User {
  id: string | number;
  email: string;
  name?: string;
  companyId?: number;
  isAdmin?: boolean;
}

export function isUser(value: unknown): value is User {
  return (
    isObject(value) &&
    (isString(value.id) || isNumber(value.id)) &&
    isString(value.email) &&
    (value.name === undefined || isString(value.name)) &&
    (value.companyId === undefined || isNumber(value.companyId)) &&
    (value.isAdmin === undefined || isBoolean(value.isAdmin))
  );
}

/**
 * Type guard for Vehicle object
 */
export interface Vehicle {
  id: string | number;
  name: string;
  type: string;
  licensePlate?: string;
  maxWeight?: number;
  companyId: number;
}

export function isVehicle(value: unknown): value is Vehicle {
  return (
    isObject(value) &&
    (isString(value.id) || isNumber(value.id)) &&
    isString(value.name) &&
    isString(value.type) &&
    (value.licensePlate === undefined || isString(value.licensePlate)) &&
    (value.maxWeight === undefined || isNumber(value.maxWeight)) &&
    isNumber(value.companyId)
  );
}

/**
 * Type guard for Driver object
 */
export interface Driver {
  id: string | number;
  name: string;
  licenseNumber: string;
  companyId: number;
  isActive?: boolean;
}

export function isDriver(value: unknown): value is Driver {
  return (
    isObject(value) &&
    (isString(value.id) || isNumber(value.id)) &&
    isString(value.name) &&
    isString(value.licenseNumber) &&
    isNumber(value.companyId) &&
    (value.isActive === undefined || isBoolean(value.isActive))
  );
}

// ============================================================================
// Utility Functions for Safe Type Conversion
// ============================================================================

/**
 * Safely convert unknown value to string
 */
export function toString(value: unknown): string {
  if (isString(value)) return value;
  if (isNumber(value)) return value.toString();
  if (isBoolean(value)) return value.toString();
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  return String(value);
}

/**
 * Safely convert unknown value to number
 */
export function toNumber(value: unknown): number | null {
  if (isNumber(value)) return value;
  if (isString(value)) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

/**
 * Safely convert unknown value to boolean
 */
export function toBoolean(value: unknown): boolean {
  if (isBoolean(value)) return value;
  if (isString(value)) return value.toLowerCase() === 'true';
  if (isNumber(value)) return value !== 0;
  return Boolean(value);
}

// ============================================================================
// Array Utility Functions with Type Safety
// ============================================================================

/**
 * Filter array with type guard
 */
export function filterWithTypeGuard<T, U extends T>(
  array: T[],
  guard: (item: T) => item is U
): U[] {
  return array.filter(guard);
}

/**
 * Find item in array with type guard
 */
export function findWithTypeGuard<T, U extends T>(
  array: T[],
  guard: (item: T) => item is U
): U | undefined {
  return array.find(guard);
}

/**
 * Safely get array item at index
 */
export function getArrayItem<T>(array: T[], index: number): T | undefined {
  return index >= 0 && index < array.length ? array[index] : undefined;
}
