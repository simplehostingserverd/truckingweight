# Prisma Role Setup for ScaleMasterAI

This guide explains how to set up and use the dedicated Prisma role in your Supabase database for improved security and data isolation between companies.

## Overview

The implementation includes:

1. A dedicated `prisma_app` database role with limited permissions
2. Row-level security (RLS) policies for company data isolation
3. Admin bypass for viewing all company data
4. TypeScript middleware for setting company context
5. Prisma client extensions for enforcing security rules

## Setup Instructions

### 1. Run the SQL Scripts

First, run the SQL scripts to set up the database role and security policies:

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the `database/prisma-role-setup.sql` script to create the Prisma role
4. Run the `database/admin-context-setup.sql` script to add admin context support

### 2. Update Environment Variables

Update your `.env` file with the Prisma role credentials:

```
# Original postgres admin connection (keep for migrations and schema updates)
DATABASE_URL_ADMIN=postgresql://postgres:your_password@db.your-project-ref.supabase.co:5432/postgres?pgbouncer=true

# Dedicated Prisma role connection (use this for application queries)
DATABASE_URL=postgresql://prisma_app:your_prisma_role_password@db.your-project-ref.supabase.co:5432/postgres?pgbouncer=true

# Connection pooling URL (for high-traffic scenarios)
POOL_CONNECTION_URL=postgresql://prisma_app:your_prisma_role_password@aws-0-us-east-2.pooler.supabase.com:6543/postgres
```

### 3. Start the Backend Server

Start the backend server to use the new Prisma role:

```bash
cd backend
npm run dev
```

## Role-Based Access Control

The implementation supports two types of users:

1. **Regular Users**: Can only see data from their own company
2. **Admin Users**: Can see data from all companies

### How It Works

1. **Authentication Middleware**: Sets the user's company ID and admin status in the request
2. **Company Context Middleware**: Sets the company context for Prisma queries
3. **Prisma Extensions**: Adds company filtering to queries based on user role
4. **Row-Level Security**: Enforces data isolation at the database level

## Dashboard Features

The dashboard now supports:

1. **Company-Specific Views**: Regular users see only their company's data
2. **Admin Overview**: Admins see aggregated data from all companies
3. **Company Filtering**: Admins can filter data by specific company
4. **Data Visualization**: Charts show compliance rates, vehicle weights, and load status

## Troubleshooting

If you encounter issues:

1. **No Data Showing**: Check that your user has the correct company_id set
2. **Permission Errors**: Verify that the Prisma role has the necessary permissions
3. **Admin Access Not Working**: Ensure the user's is_admin flag is set to true
4. **JSON Errors**: Check that the queries are properly handling empty results

## Database Schema

The database includes the following tables with company isolation:

- `companies`: Company information
- `users`: User accounts with company association
- `vehicles`: Vehicles belonging to companies
- `drivers`: Drivers belonging to companies
- `loads`: Load information for each company
- `weights`: Weight measurements for each company
- `weigh_tickets`: Tickets generated for each company

## Security Considerations

This implementation provides multiple layers of security:

1. **Database Role**: Limited permissions for the application
2. **Row-Level Security**: Database-level filtering by company
3. **Application Filtering**: Additional filtering in the Prisma queries
4. **JWT Authentication**: Secure user identification

## Next Steps

1. **Add More Tests**: Create tests for the role-based access control
2. **Implement Audit Logging**: Track data access and modifications
3. **Add More Admin Features**: Create company management screens
4. **Optimize Queries**: Add indexes and caching for better performance
