/**
 * Copyright (c) 2025 Cargo Scale Pro. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cargo Scale Pro Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cargo Scale Pro and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

/**
 * Utility functions for safe navigation and URL handling
 *
 * These functions help prevent URI.js errors by ensuring proper URL handling
 * when using Next.js router.
 */

import { ReadonlyURLSearchParams } from 'next/navigation';

/**
 * Safely creates a URL string for router.push
 *
 * @param pathname - The pathname to navigate to
 * @param query - Optional query parameters
 * @returns A properly formatted URL string
 */
export function createSafeUrl(
  pathname: string,
  query?: Record<string, string | number | boolean | undefined>
): string {
  // Start with the pathname
  let url = pathname;

  // Add query parameters if provided
  if (query && Object.keys(query).length > 0) {
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    }

    const queryString = searchParams.toString();
    if (queryString) {
      url = `${url}?${queryString}`;
    }
  }

  return url;
}

/**
 * Converts ReadonlyURLSearchParams to a plain object
 *
 * @param searchParams - Next.js ReadonlyURLSearchParams
 * @returns A plain object with the search parameters
 */
export function searchParamsToObject(
  searchParams: ReadonlyURLSearchParams
): Record<string, string> {
  const params: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

/**
 * Safely updates search parameters while preserving existing ones
 *
 * @param currentParams - Current search parameters
 * @param updates - Parameters to update
 * @returns A new object with updated parameters
 */
export function updateSearchParams(
  currentParams: Record<string, string>,
  updates: Record<string, string | number | boolean | undefined>
): Record<string, string> {
  const newParams = { ...currentParams };

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === null) {
      delete newParams[key];
    } else {
      newParams[key] = String(value);
    }
  }

  return newParams;
}
