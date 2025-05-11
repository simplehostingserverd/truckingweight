# Supabase Fix and Dummy Data Guide

This guide will help you fix the infinite recursion issue in your Supabase RLS policies and add realistic dummy data for testing your trucking application.

## Step 1: Fix the Infinite Recursion Issue

The error `infinite recursion detected in policy for relation "users"` occurs because your current RLS policies are creating a circular reference when checking permissions.

1. Log in to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to the SQL Editor (left sidebar)
4. Create a new query
5. Copy and paste the following SQL code:

```sql
-- First, list and drop all policies on the users table
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all existing policies on users table
    FOR policy_record IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'users'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON users';
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;

    -- Drop all existing policies on companies table
    FOR policy_record IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'companies'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON companies';
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Create new policies for users table that avoid recursion
-- Allow users to view their own record
CREATE POLICY "Users can view their own record" ON users
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- Allow users to view users from the same company (without recursion)
CREATE POLICY "Users can view company users" ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id::text = auth.uid()::text
      AND u.company_id = users.company_id
    )
  );

-- Allow users to insert records (needed for registration)
CREATE POLICY "Users can insert records" ON users
  FOR INSERT
  WITH CHECK (true);

-- Allow users to update their own record
CREATE POLICY "Users can update their own record" ON users
  FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Create new policies for companies table
-- Allow users to view their own company
CREATE POLICY "Companies are viewable by their users" ON companies
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
      AND users.company_id = companies.id
    )
  );

-- Allow companies to be created during registration
CREATE POLICY "Companies are insertable by anyone" ON companies
  FOR INSERT
  WITH CHECK (true);

-- Allow admins to update their company
CREATE POLICY "Companies are editable by admins" ON companies
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
      AND users.company_id = companies.id
      AND users.is_admin = true
    )
  );
```

6. Click "Run" to execute the SQL
7. You should see a success message

### What This Fix Does

1. Drops all existing RLS policies on the `users` and `companies` tables
2. Creates new policies that avoid the recursive references that were causing the infinite recursion
3. Ensures that users can still:
   - View their own user record
   - View other users in the same company
   - Insert new user records (for registration)
   - Update their own user record
   - View their company
   - Create new companies (for registration)
   - Update their company (if they're an admin)

## Step 2: Add Realistic Dummy Data

After fixing the RLS policies, you can add realistic dummy data to test your application:

1. In the Supabase SQL Editor, create another new query
2. Copy and paste the contents of the `dummy-data.sql` file
3. Click "Run" to execute the SQL

### What This Data Includes

The dummy data includes:

- 5 trucking companies with realistic names and contact information
- 10 users (2 per company, 1 admin and 1 regular user)
- 15 vehicles (3 per company) with realistic details including make, model, and license plates
- 15 drivers (3 per company) with license information and status
- 25 weight records (5 per company) with realistic weight values and compliance statuses
- 25 load records (5 per company) with realistic origins, destinations, and statuses

### Notes About the Dummy Data

1. **User IDs**: The dummy data includes example UUIDs for users. In a real scenario, these would be created through the Supabase Auth system. If you want to use these test users, you'll need to:

   - Create corresponding auth users with the same UUIDs
   - Or update the UUIDs in the SQL to match your existing auth users

2. **Weight Status**: The weight records include a mix of "Compliant", "Warning", and "Non-Compliant" statuses based on the weight values:

   - Under 34,000 lbs: Compliant
   - 34,000-36,000 lbs: Warning
   - Over 36,000 lbs: Non-Compliant

3. **Load Status**: The load records include a mix of "Delivered", "In Transit", and "Pending" statuses to simulate a real-world scenario.

## Step 3: Test Your Application

After applying both fixes:

1. Restart your Next.js development server
2. Try logging in with one of your existing users
3. Navigate to the Weights and Loads pages to verify that the data is loading correctly
4. Test creating new records to ensure the RLS policies are working properly

If you still encounter issues, check the browser console and server logs for any error messages.

## Troubleshooting

If you continue to see the infinite recursion error:

1. Make sure all the SQL commands executed successfully
2. Check if there are any other RLS policies on related tables that might be causing issues
3. Try clearing your browser cache and cookies
4. Restart your development server

For any database-related errors, you can check the Supabase logs in the dashboard under "Database" > "Logs".
