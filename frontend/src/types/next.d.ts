/**
 * Type definitions for Next.js
 *
 * This file contains type definitions for Next.js features
 * to ensure type safety throughout the application.
 */

/**
 * Type for URL search parameters which can be string, string[] or undefined
 */
export type SearchParamValue = string | string[] | undefined;

/**
 * Type for URL search parameters object with string values
 */
export interface ParsedSearchParams {
  [key: string]: string;
}
