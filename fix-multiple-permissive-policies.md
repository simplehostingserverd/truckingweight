# Fixing Multiple Permissive Policies in Supabase

This document provides guidance on how to fix the "Multiple Permissive Policies" performance issue in Supabase databases.

## The Problem

When a table has multiple permissive policies for the same role and action (e.g., SELECT), PostgreSQL must evaluate all of them for each query, which is inefficient and can lead to performance issues.

## The Solution

The solution is to consolidate multiple permissive policies for the same role and action into a single policy. Here's a step-by-step approach:

### Step 1: Identify the Affected Tables

Use the Supabase Dashboard's Security Advisor to identify tables with multiple permissive policies for the same role and action.

### Step 2: Analyze the Existing Policies

For each affected table, analyze the existing policies to understand their conditions:

```sql
SELECT policyname, permissive, cmd, roles, qual 
FROM pg_policies 
WHERE tablename = 'your_table_name';
```

### Step 3: Create a Consolidated Policy

Create a new policy that combines the conditions of the existing policies using logical OR:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Policy 1" ON your_table_name;
DROP POLICY IF EXISTS "Policy 2" ON your_table_name;

-- Create a consolidated policy
CREATE POLICY "Consolidated Policy" 
ON your_table_name
FOR SELECT
USING (
  -- Condition from Policy 1
  (condition_1)
  OR
  -- Condition from Policy 2
  (condition_2)
);
```

### Step 4: Create Separate Policies for Different Actions

If the original policies covered different actions (SELECT, INSERT, UPDATE, DELETE), create separate policies for each action:

```sql
-- For INSERT operations
CREATE POLICY "Policy for INSERT" 
ON your_table_name
FOR INSERT
WITH CHECK (condition_for_insert);

-- For UPDATE operations
CREATE POLICY "Policy for UPDATE" 
ON your_table_name
FOR UPDATE
USING (condition_for_update);

-- For DELETE operations
CREATE POLICY "Policy for DELETE" 
ON your_table_name
FOR DELETE
USING (condition_for_delete);
```

## Example: Fixing city_weigh_tickets Table

Here's an example of how we fixed the multiple permissive policies on the `city_weigh_tickets` table:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "City users can only view weigh tickets from their own city" ON city_weigh_tickets;
DROP POLICY IF EXISTS "City staff can manage weigh tickets from their own city" ON city_weigh_tickets;

-- Create a single SELECT policy for all city users
CREATE POLICY "City users can view weigh tickets from their own city" 
ON city_weigh_tickets
FOR SELECT
USING (auth.uid() IN (
  SELECT city_users.id 
  FROM city_users 
  WHERE city_users.city_id = city_weigh_tickets.city_id
));

-- Create separate policies for INSERT, UPDATE, DELETE operations
CREATE POLICY "City staff can insert weigh tickets for their own city" 
ON city_weigh_tickets
FOR INSERT
WITH CHECK (auth.uid() IN (
  SELECT city_users.id 
  FROM city_users 
  WHERE city_users.city_id = city_weigh_tickets.city_id 
  AND city_users.role::text = ANY (ARRAY['admin'::character varying, 'operator'::character varying, 'inspector'::character varying]::text[])
));

-- Similar policies for UPDATE and DELETE...
```

## Benefits

By consolidating multiple permissive policies:

1. You improve query performance by reducing the number of policy evaluations
2. You make your RLS setup clearer and easier to maintain
3. You avoid potential confusion about which policy is controlling access

## Automation

For projects with many tables affected by this issue, consider creating a script that:

1. Identifies tables with multiple permissive policies
2. Analyzes the policies to determine how to consolidate them
3. Generates and executes the SQL statements to fix the issues

This approach can save time and ensure consistency across your database.
