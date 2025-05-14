# URI.js Issue Fix Guide

## Problem Description

The CI/CD pipeline is failing with URI.js related errors in job 5989990Z. This is likely due to URL mutation issues in the Next.js application. The error occurs because:

1. URI.js is a dependency used by several packages for URL parsing and manipulation
2. When URLs are mutated incorrectly, it can cause URI.js to throw errors
3. This commonly happens with the Next.js router when manipulating URLs

## Common Causes

1. **Mutating URL objects directly**: Next.js URL objects should not be mutated directly
2. **Incorrect query parameter handling**: Improper manipulation of query parameters
3. **Invalid URL characters**: Using characters that need to be encoded in URLs
4. **Circular references in URL objects**: Creating circular references when manipulating URLs

## Solution

### 1. Fix Router Push Calls

Replace direct URL mutation with proper URL construction:

```javascript
// INCORRECT - Mutating URL directly
const url = new URL(window.location.href);
url.searchParams.set('filter', 'value');
router.push(url);

// CORRECT - Using query object
router.push({
  pathname: router.pathname,
  query: { ...router.query, filter: 'value' }
});
```

### 2. Fix Query Parameter Handling

Ensure query parameters are properly encoded:

```javascript
// INCORRECT
router.push(`/search?q=${searchTerm}`);

// CORRECT
router.push({
  pathname: '/search',
  query: { q: searchTerm }
});
```

### 3. Fix URL Construction

Use the URL constructor properly:

```javascript
// INCORRECT
const url = new URL(`${window.location.origin}${path}`);
url.searchParams.set('key', value);

// CORRECT
const url = new URL(path, window.location.origin);
url.searchParams.set('key', value);
```

### 4. Fix useRouter Usage

Ensure proper usage of the Next.js router:

```javascript
// INCORRECT
const router = useRouter();
const newUrl = { ...router, query: { ...router.query, filter: 'value' } };
router.push(newUrl);

// CORRECT
const router = useRouter();
router.push({
  pathname: router.pathname,
  query: { ...router.query, filter: 'value' }
});
```

## Specific Files to Check

Based on the codebase analysis, check these files for potential URL mutation issues:

1. `/frontend/src/components/examples/SearchParamsExample.tsx`
2. `/frontend/src/providers/SupabaseAuthProvider.tsx`
3. `/frontend/src/components/Dashboard/DashboardHeader.tsx`
4. `/frontend/src/components/CityDashboard/CityDashboardHeader.tsx`
5. `/frontend/src/app/(dashboard)/weights/new/page.tsx`
6. `/frontend/src/app/(dashboard)/weights/[id]/edit/page.tsx`

## Implementation Steps

1. Search for all instances of `router.push` in the codebase
2. Check if any URLs are being mutated directly
3. Replace direct URL mutations with proper router.push calls using pathname and query objects
4. Ensure all URL parameters are properly encoded
5. Test the application to ensure navigation works correctly

## Additional Recommendations

1. **Add ESLint rule**: Add an ESLint rule to prevent direct URL mutation
2. **Use URLSearchParams**: When manipulating query parameters, use URLSearchParams
3. **Avoid window.location**: Use Next.js router methods instead of window.location
4. **Test navigation**: Add tests for navigation to catch URL-related issues early

## Example Fix

```javascript
// Before
const handleSearch = () => {
  const url = new URL(window.location.href);
  url.searchParams.set('q', searchTerm);
  url.searchParams.set('page', '1');
  router.push(url.toString());
};

// After
const handleSearch = () => {
  router.push({
    pathname: router.pathname,
    query: { 
      ...router.query,
      q: searchTerm,
      page: 1
    }
  });
};
```

By implementing these fixes, the URI.js errors in the CI/CD pipeline should be resolved.
