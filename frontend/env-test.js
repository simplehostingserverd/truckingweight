/**
 * Copyright (c) 2025 Cargo Scale Pro Inc. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of the Cargo Scale Pro Inc Weight Management System.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * This file contains proprietary and confidential information of
 * Cargo Scale Pro Inc and may not be copied, distributed, or used
 * in any way without explicit written permission.
 */

// Simple script to test environment variables
console.log('Testing environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log(
  'NEXT_PUBLIC_SUPABASE_ANON_KEY:',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Defined' : 'Undefined'
);
console.log(
  'NEXT_PUBLIC_MAPBOX_TOKEN:',
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? 'Defined' : 'Undefined'
);
console.log(
  'NEXT_PUBLIC_CESIUM_TOKEN:',
  process.env.NEXT_PUBLIC_CESIUM_TOKEN ? 'Defined' : 'Undefined'
);
console.log(
  'NEXT_PUBLIC_MAPTILER_KEY:',
  process.env.NEXT_PUBLIC_MAPTILER_KEY ? 'Defined' : 'Undefined'
);
