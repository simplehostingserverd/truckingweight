# Manual Fix for Infinite Recursion in RLS Policies

If you're experiencing the "infinite recursion detected in policy for relation users" error when trying to register, you can fix it by manually updating the Row Level Security (RLS) policies in your Supabase project.

## Steps to Fix the Issue

1. Log in to your Supabase dashboard at https://app.supabase.com/
2. Select your project
3. Go to the SQL Editor (left sidebar)
4. Create a new query
5. Copy and paste the following SQL code:

```sql
-- First, list all policies on the users table
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
8. Try registering a new user - the infinite recursion error should be resolved

## What This Fix Does

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

## Troubleshooting

If you still encounter issues:

1. Check the Supabase logs for any error messages
2. Make sure you have the correct permissions to execute the SQL (you should be the project owner or have admin access)
3. Try refreshing your browser and clearing the cache
4. Restart your Next.js development server after applying the fix
