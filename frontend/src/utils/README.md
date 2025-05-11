# Utility Functions

This directory contains utility functions used throughout the application.

## Search Parameters Utilities

The `searchParams.ts` file provides utility functions for safely handling URL search parameters in Next.js applications. These functions help prevent common bugs related to the `string | string[] | undefined` type of search parameters.

### Why These Utilities Are Needed

In Next.js, when accessing URL search parameters using `searchParams.get()` or similar methods, the return type can be:

- `string` for a single value
- `string[]` for multiple values with the same key
- `undefined` if the parameter doesn't exist

This can lead to bugs when you expect a string but get an array or undefined. Our utility functions safely handle all these cases.

### Available Functions

#### `toSearchParamString`

Safely converts a search parameter value to a string.

```typescript
function toSearchParamString(value: SearchParamValue, defaultValue: string = ''): string;
```

Example:

```typescript
// In a route handler
const url = new URL(request.url);
const query = toSearchParamString(url.searchParams.get('q'), '');

// In a client component
const searchParams = useSearchParams();
const category = toSearchParamString(searchParams.get('category'), 'all');
```

#### `toSearchParamNumber`

Safely converts a search parameter value to a number.

```typescript
function toSearchParamNumber(value: SearchParamValue, defaultValue: number = 0): number;
```

Example:

```typescript
const page = toSearchParamNumber(searchParams.get('page'), 1);
const limit = toSearchParamNumber(searchParams.get('limit'), 10);
```

#### `toSearchParamBoolean`

Safely converts a search parameter value to a boolean.

```typescript
function toSearchParamBoolean(value: SearchParamValue, defaultValue: boolean = false): boolean;
```

Example:

```typescript
const showDetails = toSearchParamBoolean(searchParams.get('details'), false);
```

#### `parseSearchParams`

Parses all search parameters into a clean object with string values.

```typescript
function parseSearchParams(searchParams: Record<string, SearchParamValue>): ParsedSearchParams;
```

Example:

```typescript
const params = parseSearchParams(Object.fromEntries(searchParams.entries()));
```

#### `createSearchParams`

Creates a URLSearchParams object from a record of search parameters.

```typescript
function createSearchParams(
  params: Record<string, string | number | boolean | undefined>
): URLSearchParams;
```

Example:

```typescript
const params = createSearchParams({
  query: searchQuery,
  page: currentPage,
  category: selectedCategory !== 'all' ? selectedCategory : undefined,
});

router.push(`?${params.toString()}`);
```

### Best Practices

1. Always use these utility functions when handling search parameters to avoid type-related bugs.
2. Provide meaningful default values for parameters that might be undefined.
3. When updating the URL with new search parameters, use the `createSearchParams` function to ensure proper formatting.

### Example Usage in Route Handlers

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { toSearchParamString, toSearchParamNumber } from '@/utils/searchParams';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const query = toSearchParamString(url.searchParams.get('q'), '');
  const page = toSearchParamNumber(url.searchParams.get('page'), 1);

  // Use the parameters safely...
}
```

### Example Usage in Client Components

```typescript
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { toSearchParamString, createSearchParams } from '@/utils/searchParams';

export default function SearchComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = toSearchParamString(searchParams.get('q'), '');

  const updateSearch = (newQuery: string) => {
    const params = createSearchParams({
      q: newQuery,
    });

    router.push(`?${params.toString()}`);
  };

  // Component implementation...
}
```
