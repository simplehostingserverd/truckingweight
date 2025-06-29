<!--

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
 

-->

# URI.js Fixes Applied

## Problem Summary

The CI/CD pipeline was failing with URI.js related errors in job 5989990Z. This was caused by improper URL mutation in the Next.js application, particularly when using `router.push()` with string URLs.

## Fixes Applied

### 1. Created Navigation Utility Functions

Created a new utility file at `/frontend/src/utils/navigation.ts` with safe URL handling functions:

- `createSafeUrl()`: Safely creates URL strings for navigation
- `searchParamsToObject()`: Converts Next.js search params to plain objects
- `updateSearchParams()`: Safely updates search parameters

### 2. Fixed Router Push Calls

Updated all instances of `router.push()` to use the object syntax instead of string URLs:

```javascript
// BEFORE - Problematic
router.push('/some/path');
router.push(`/some/path/${id}`);
router.push(`?${params.toString()}`);

// AFTER - Fixed
router.push({ pathname: '/some/path' });
router.push({ pathname: `/some/path/${id}` });
router.push({
  pathname: window.location.pathname,
  query: { param1: value1, param2: value2 }
});
```

### 3. Fixed Components

The following components were updated:

#### SearchParamsExample.tsx
- Fixed URL mutation in the `updateFilters()` function
- Now uses proper query object syntax

#### SupabaseAuthProvider.tsx
- Fixed URL handling in `signIn()` and `signOut()` functions
- Now uses object syntax for router.push

#### DashboardHeader.tsx
- Fixed URL handling in `handleSignOut()` function
- Now uses object syntax for router.push

#### CityDashboardHeader.tsx
- Fixed URL handling in `handleLogout()` function
- Now uses object syntax for router.push

#### weights/new/page.tsx
- Fixed multiple instances of URL handling
- Updated session check redirects and form submission redirects

#### weights/[id]/edit/page.tsx
- Fixed URL handling in session checks and form submission
- Now uses object syntax for router.push

## Why This Fixes the Issue

The URI.js library is used internally by Next.js for URL parsing and manipulation. When URLs are mutated incorrectly (especially with string concatenation or template literals), it can cause URI.js to throw errors.

By using the object syntax for `router.push()`, we ensure that:

1. URLs are properly encoded
2. Query parameters are handled correctly
3. No direct URL mutation occurs
4. Next.js can safely construct the URL

## Additional Recommendations

1. **Use the navigation utility functions**: For any future URL handling, use the utility functions in `/frontend/src/utils/navigation.ts`

2. **Avoid string URLs in router.push**: Always use the object syntax:
   ```javascript
   router.push({
     pathname: '/path',
     query: { param: value }
   });
   ```

3. **Add ESLint rule**: Consider adding an ESLint rule to prevent direct URL mutation

4. **Update other components**: Apply the same pattern to any other components that use router.push

## Testing

The fixes have been applied and should resolve the URI.js errors in the CI/CD pipeline. Run the CI/CD pipeline again to verify that the issue is resolved.
