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

# Setting Up a Dedicated Prisma Role in Supabase

This guide explains how to set up a dedicated database role for Prisma in your Supabase project to improve security and auditing capabilities.

## Why Use a Dedicated Prisma Role?

Using a dedicated database role for Prisma offers several benefits:

1. **Principle of Least Privilege**: The role has only the permissions it needs to function, reducing the risk if credentials are compromised.
2. **Better Auditing**: Database actions can be traced to a specific application role.
3. **Row-Level Security**: Enables proper enforcement of row-level security policies.
4. **Separation of Concerns**: Keeps application access separate from admin/migration access.

## Setup Instructions

### 1. Create the Prisma Role in Supabase

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `prisma-role-setup.sql` from this directory
4. Run the SQL script in the Supabase SQL Editor
5. Make sure to change the default password in the script to a secure one

### 2. Update Environment Variables

1. Update your `.env` file with the new connection string using the Prisma role:

```
# Original postgres admin connection (keep for migrations and schema updates)
DATABASE_URL_ADMIN=postgresql://postgres:your_password@db.your-project-ref.supabase.co:5432/postgres?pgbouncer=true

# Dedicated Prisma role connection (use this for application queries)
DATABASE_URL=postgresql://prisma_app:your_prisma_role_password@db.your-project-ref.supabase.co:5432/postgres?pgbouncer=true
```

2. For Prisma migrations, use the admin connection:

```bash
# Run migrations with admin role
npx prisma migrate dev --schema=./prisma/schema.prisma --name=your_migration_name
```

### 3. Configure Your Application

1. Use the Prisma client singleton from `backend/config/prisma.ts`
2. Add the company context middleware to your Express app:

```typescript
import express from 'express';
import setCompanyContextMiddleware from './middleware/companyContext';

const app = express();

// Add the middleware after authentication middleware
app.use(authMiddleware);
app.use(setCompanyContextMiddleware);
```

## Row-Level Security

The setup includes row-level security policies that filter data based on the company_id. This ensures that:

1. Users can only access data from their own company
2. The Prisma role respects these security boundaries
3. Even if SQL queries are constructed incorrectly, the database enforces access controls

## Troubleshooting

If you encounter permission issues:

1. Check that the role was created successfully in Supabase
2. Verify that the correct permissions were granted
3. Ensure your connection string is using the correct credentials
4. For migrations, make sure you're using the admin connection string

## Security Considerations

1. Store the Prisma role password securely
2. Rotate the password periodically
3. Consider using Prisma Accelerate for additional security
4. Monitor database access logs for unusual activity

## Additional Resources

- [Prisma Security Best Practices](https://www.prisma.io/docs/concepts/components/prisma-client/security)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Role Management](https://www.postgresql.org/docs/current/user-manag.html)
