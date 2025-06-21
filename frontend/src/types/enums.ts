/**
 * Proper TypeScript Enum and String Literal Type Definitions
 * Following best practices to avoid numeric enum pitfalls
 */

// ============================================================================
// String Literal Types (Preferred over numeric enums)
// ============================================================================

/**
 * User roles as string literal type
 */
export type UserRole = 'admin' | 'user' | 'driver' | 'dispatcher' | 'city_official';

/**
 * Vehicle types as string literal type
 */
export type VehicleType = 'truck' | 'trailer' | 'semi' | 'van' | 'pickup';

/**
 * Load status as string literal type
 */
export type LoadStatus = 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';

/**
 * Weight measurement units as string literal type
 */
export type WeightUnit = 'lbs' | 'kg' | 'tons';

/**
 * Document types as string literal type
 */
export type DocumentType = 'license' | 'insurance' | 'registration' | 'permit' | 'inspection';

/**
 * Violation severity levels as string literal type
 */
export type ViolationSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Payment status as string literal type
 */
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded';

/**
 * Notification types as string literal type
 */
export type NotificationType = 'info' | 'warning' | 'error' | 'success';

// ============================================================================
// String Enums (When you need both type safety and object-like access)
// ============================================================================

/**
 * API endpoints enum with string values
 */
export enum ApiEndpoints {
  USERS = "USERS",
  VEHICLES = "VEHICLES",
  DRIVERS = "DRIVERS",
  LOADS = "LOADS",
  WEIGHTS = "WEIGHTS",
  COMPANIES = "COMPANIES",
  REPORTS = "REPORTS",
  AUTH = "AUTH",
  DASHBOARD = "DASHBOARD"
}

/**
 * HTTP methods enum with string values
 */
export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE"
}

/**
 * Local storage keys enum with string values
 */
export enum StorageKeys {
  AUTH_TOKEN = "AUTH_TOKEN",
  USER_PREFERENCES = "USER_PREFERENCES",
  THEME = "THEME",
  LANGUAGE = "LANGUAGE",
  LAST_ROUTE = "LAST_ROUTE"
}

/**
 * Event names enum with string values
 */
export enum EventNames {
  USER_LOGIN = "USER_LOGIN",
  USER_LOGOUT = "USER_LOGOUT",
  WEIGHT_CAPTURED = "WEIGHT_CAPTURED",
  LOAD_ASSIGNED = "LOAD_ASSIGNED",
  VIOLATION_DETECTED = "VIOLATION_DETECTED",
  DOCUMENT_UPLOADED = "DOCUMENT_UPLOADED"
}

/**
 * Theme modes enum with string values
 */
export enum ThemeMode {
  LIGHT = "LIGHT",
  DARK = "DARK",
  SYSTEM = "SYSTEM"
}

// ============================================================================
// Const Assertions for Immutable Arrays (Alternative to enums)
// ============================================================================

/**
 * Available languages as const assertion
 */
export const LANGUAGES = ['en', 'es', 'fr', 'de'] as const;
export type Language = typeof LANGUAGES[number];

/**
 * Time zones as const assertion
 */
export const TIME_ZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
] as const;
export type TimeZone = typeof TIME_ZONES[number];

/**
 * File types as const assertion
 */
export const FILE_TYPES = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'] as const;
export type FileType = typeof FILE_TYPES[number];

/**
 * Sort directions as const assertion
 */
export const SORT_DIRECTIONS = ['asc', 'desc'] as const;
export type SortDirection = typeof SORT_DIRECTIONS[number];

// ============================================================================
// Type Guard Functions for Enums and String Literals
// ============================================================================

/**
 * Type guard for UserRole
 */
export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && 
    ['admin', 'user', 'driver', 'dispatcher', 'city_official'].includes(value);
}

/**
 * Type guard for VehicleType
 */
export function isVehicleType(value: unknown): value is VehicleType {
  return typeof value === 'string' && 
    ['truck', 'trailer', 'semi', 'van', 'pickup'].includes(value);
}

/**
 * Type guard for LoadStatus
 */
export function isLoadStatus(value: unknown): value is LoadStatus {
  return typeof value === 'string' && 
    ['pending', 'assigned', 'in_transit', 'delivered', 'cancelled'].includes(value);
}

/**
 * Type guard for WeightUnit
 */
export function isWeightUnit(value: unknown): value is WeightUnit {
  return typeof value === 'string' && ['lbs', 'kg', 'tons'].includes(value);
}

/**
 * Type guard for DocumentType
 */
export function isDocumentType(value: unknown): value is DocumentType {
  return typeof value === 'string' && 
    ['license', 'insurance', 'registration', 'permit', 'inspection'].includes(value);
}

/**
 * Type guard for ViolationSeverity
 */
export function isViolationSeverity(value: unknown): value is ViolationSeverity {
  return typeof value === 'string' && ['low', 'medium', 'high', 'critical'].includes(value);
}

/**
 * Type guard for PaymentStatus
 */
export function isPaymentStatus(value: unknown): value is PaymentStatus {
  return typeof value === 'string' && 
    ['pending', 'paid', 'overdue', 'cancelled', 'refunded'].includes(value);
}

/**
 * Type guard for NotificationType
 */
export function isNotificationType(value: unknown): value is NotificationType {
  return typeof value === 'string' && ['info', 'warning', 'error', 'success'].includes(value);
}

/**
 * Type guard for Language
 */
export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && LANGUAGES.includes(value as Language);
}

/**
 * Type guard for TimeZone
 */
export function isTimeZone(value: unknown): value is TimeZone {
  return typeof value === 'string' && TIME_ZONES.includes(value as TimeZone);
}

/**
 * Type guard for FileType
 */
export function isFileType(value: unknown): value is FileType {
  return typeof value === 'string' && FILE_TYPES.includes(value as FileType);
}

/**
 * Type guard for SortDirection
 */
export function isSortDirection(value: unknown): value is SortDirection {
  return typeof value === 'string' && SORT_DIRECTIONS.includes(value as SortDirection);
}

// ============================================================================
// Utility Functions for Working with Enums and String Literals
// ============================================================================

/**
 * Get all values of a string literal type as an array
 */
export function getEnumValues<T extends Record<string, string>>(enumObject: T): T[keyof T][] {
  return Object.values(enumObject);
}

/**
 * Get all keys of a string literal type as an array
 */
export function getEnumKeys<T extends Record<string, string>>(enumObject: T): (keyof T)[] {
  return Object.keys(enumObject);
}

/**
 * Check if a value is a valid enum value
 */
export function isValidEnumValue<T extends Record<string, string>>(
  enumObject: T,
  value: unknown
): value is T[keyof T] {
  return typeof value === 'string' && Object.values(enumObject).includes(value);
}

/**
 * Safely convert string to enum value with fallback
 */
export function toEnumValue<T extends Record<string, string>>(
  enumObject: T,
  value: unknown,
  fallback: T[keyof T]
): T[keyof T] {
  return isValidEnumValue(enumObject, value) ? value : fallback;
}
