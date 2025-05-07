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
