/**
 * Copyright (c) 2025 Cosmo Exploit Group LLC. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cosmo Exploit Group LLC Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cosmo Exploit Group LLC and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

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
