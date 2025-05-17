<!--

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
 

-->

# Next.js App Router Migration Guide

This document provides guidance on migrating from the Pages Router to the App Router in Next.js.

## Overview of Changes

1. **Directory Structure**: Moving from `/pages` to `/app`
2. **Routing**: New file-based routing system with nested layouts
3. **Data Fetching**: Server Components and new data fetching methods
4. **Rendering**: Client and Server Components
5. **Styling**: CSS Modules and CSS-in-JS support
6. **Metadata**: New metadata API

## Migration Steps

### 1. Update Dependencies

Run the dependency update script to ensure you have the latest versions:

```bash
npm run update-deps
```

### 2. File Structure Migration

| Pages Router            | App Router                                     |
| ----------------------- | ---------------------------------------------- |
| `/pages/index.js`       | `/app/page.tsx`                                |
| `/pages/about.js`       | `/app/about/page.tsx`                          |
| `/pages/blog/[slug].js` | `/app/blog/[slug]/page.tsx`                    |
| `/pages/_app.js`        | `/app/layout.tsx`                              |
| `/pages/_document.js`   | (No direct equivalent - handled by App Router) |
| `/pages/api/*`          | `/app/api/*` (API Routes remain similar)       |

### 3. Component Migration

#### Server Components (Default)

Server Components are the default in App Router. They:

- Cannot use hooks or browser APIs
- Can directly fetch data
- Are not interactive

Example:

```tsx
// app/page.tsx
export default async function Page() {
  // This runs on the server
  const data = await fetchData();

  return <div>{data.title}</div>;
}
```

#### Client Components

For interactive components that need hooks or browser APIs:

```tsx
'use client'; // This directive marks it as a Client Component

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
```

### 4. Data Fetching

#### Pages Router:

```tsx
// pages/index.js
export async function getServerSideProps() {
  const res = await fetch('https://api.example.com/data');
  const data = await res.json();

  return { props: { data } };
}

export default function Home({ data }) {
  return <div>{data.title}</div>;
}
```

#### App Router:

```tsx
// app/page.tsx
export default async function Home() {
  const res = await fetch('https://api.example.com/data');
  const data = await res.json();

  return <div>{data.title}</div>;
}
```

### 5. Layouts

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### 6. Metadata

```tsx
// app/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Page',
  description: 'Page description',
};

export default function Page() {
  return <div>Content</div>;
}
```

### 7. Navigation

```tsx
// Client Component
'use client';

import { useRouter } from 'next/navigation'; // Note: 'navigation', not 'router'

export default function NavigationButton() {
  const router = useRouter();

  return <button onClick={() => router.push('/dashboard')}>Go to Dashboard</button>;
}
```

## Testing Your Migration

1. Run the development server:

   ```bash
   npm run dev
   ```

2. Check for any console errors or warnings

3. Test all routes and functionality

4. Verify that data fetching works correctly

5. Test client-side navigation

## Common Issues

1. **Using hooks in Server Components**: Move the component to a separate file and mark it with `'use client'`

2. **Missing `'use client'` directive**: If you see errors about hooks or browser APIs, add the directive

3. **Data fetching errors**: Ensure you're using the correct data fetching pattern for App Router

4. **Layout issues**: Make sure you have the correct layout hierarchy

5. **Route conflicts**: Check for naming conflicts between routes and folders

## Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
