/**
 * Utility functions for handling URL search parameters
 * 
 * This file provides functions to safely handle URL search parameters
 * and convert them to appropriate types, avoiding common issues with
 * string[] parameters in Next.js.
 */

import { SearchParamValue, ParsedSearchParams } from '@/types/next.d';

/**
 * Safely converts a search parameter value to a string
 * 
 * @param value - The search parameter value (string | string[] | undefined)
 * @param defaultValue - Optional default value if the parameter is undefined
 * @returns A clean string representation of the search parameter
 */
export function toSearchParamString(value: SearchParamValue, defaultValue: string = ''): string {
  // If value is undefined, return the default value
  if (value === undefined) {
    return defaultValue;
  }
  
  // If value is already a string, return it
  if (typeof value === 'string') {
    return value;
  }
  
  // If value is an array, join it with commas
  // This handles the case where multiple values are provided for the same parameter
  if (Array.isArray(value)) {
    return value.join(',');
  }
  
  // Fallback for any other case
  return String(value) || defaultValue;
}

/**
 * Safely converts a search parameter value to a number
 * 
 * @param value - The search parameter value (string | string[] | undefined)
 * @param defaultValue - Optional default value if the parameter is undefined or not a valid number
 * @returns A number representation of the search parameter
 */
export function toSearchParamNumber(value: SearchParamValue, defaultValue: number = 0): number {
  const stringValue = toSearchParamString(value, String(defaultValue));
  const numberValue = Number(stringValue);
  
  return isNaN(numberValue) ? defaultValue : numberValue;
}

/**
 * Safely converts a search parameter value to a boolean
 * 
 * @param value - The search parameter value (string | string[] | undefined)
 * @param defaultValue - Optional default value if the parameter is undefined
 * @returns A boolean representation of the search parameter
 */
export function toSearchParamBoolean(value: SearchParamValue, defaultValue: boolean = false): boolean {
  if (value === undefined) {
    return defaultValue;
  }
  
  const stringValue = toSearchParamString(value).toLowerCase();
  
  // Check for common truthy values
  return ['true', '1', 'yes', 'y'].includes(stringValue);
}

/**
 * Parses all search parameters into a clean object with string values
 * 
 * @param searchParams - The search parameters object from Next.js
 * @returns An object with all search parameters converted to strings
 */
export function parseSearchParams(
  searchParams: Record<string, SearchParamValue>
): ParsedSearchParams {
  const result: ParsedSearchParams = {};
  
  for (const [key, value] of Object.entries(searchParams)) {
    result[key] = toSearchParamString(value);
  }
  
  return result;
}

/**
 * Creates a URLSearchParams object from a record of search parameters
 * 
 * @param params - Record of search parameters
 * @returns URLSearchParams object
 */
export function createSearchParams(params: Record<string, string | number | boolean | undefined>): URLSearchParams {
  const searchParams = new URLSearchParams();
  
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  }
  
  return searchParams;
}
