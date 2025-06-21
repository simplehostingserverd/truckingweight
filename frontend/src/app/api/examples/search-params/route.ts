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

import { NextRequest, NextResponse } from 'next/server';
import {
  toSearchParamString,
  toSearchParamNumber,
  toSearchParamBoolean,
} from '@/utils/searchParams';

/**
 * Example API route demonstrating safe search parameter handling
 *
 * This route shows how to safely handle search parameters that might be
 * string, string[], or undefined, avoiding common bugs in Next.js applications.
 */
export async function GET(request: NextRequest) {
  // Get the URL from the request
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const url = new URL(request.url);

  // Extract search parameters safely
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const name = toSearchParamString(url.searchParams.get('name'), 'Guest');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const page = toSearchParamNumber(url.searchParams.get('page'), 1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const limit = toSearchParamNumber(url.searchParams.get('limit'), 10);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const showDetails = toSearchParamBoolean(url.searchParams.get('details'), false);

  // Handle potential array parameters safely
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const tags = toSearchParamString(url.searchParams.get('tags'), '');
  const tagArray = tags ? tags.split(',') : [];

  // Create response data
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const responseData = {
    name,
    page,
    limit,
    showDetails,
    tags: tagArray,
    message: `Hello ${name}! You're viewing page ${page} with ${limit} items per page.`,
  };

  return NextResponse.json(responseData);
}
