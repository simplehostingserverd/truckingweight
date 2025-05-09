-- SQL script to create a dedicated Prisma role with minimal permissions
-- Run this in the Supabase SQL Editor

-- Create a new role for Prisma with login capability
CREATE ROLE prisma_app WITH 
  LOGIN 
  PASSWORD 'prisma_strong_password_change_me' 
  NOSUPERUSER 
  NOCREATEDB 
  NOCREATEROLE;

-- Grant connect permission on the database
GRANT CONNECT ON DATABASE postgres TO prisma_app;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO prisma_app;

-- Grant permissions on all tables in the schema
-- Read permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO prisma_app;

-- Write permissions (adjust as needed based on your security requirements)
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO prisma_app;

-- Grant permissions on sequences (for ID generation)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO prisma_app;

-- Set default permissions for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO prisma_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT USAGE, SELECT ON SEQUENCES TO prisma_app;

-- Revoke permissions on auth schema tables if you don't want Prisma to access them
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth FROM prisma_app;

-- Optional: Set up row-level security for specific tables
-- Example for the users table:
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for users table that restricts access based on company_id
CREATE POLICY users_company_isolation ON users 
  FOR ALL
  USING (company_id = current_setting('app.current_company_id', true)::int);

-- Create policy for companies table
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY companies_isolation ON companies 
  FOR ALL
  USING (id = current_setting('app.current_company_id', true)::int);

-- Create similar policies for other tables with company_id
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY drivers_company_isolation ON drivers 
  FOR ALL
  USING (company_id = current_setting('app.current_company_id', true)::int);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY vehicles_company_isolation ON vehicles 
  FOR ALL
  USING (company_id = current_setting('app.current_company_id', true)::int);

ALTER TABLE loads ENABLE ROW LEVEL SECURITY;
CREATE POLICY loads_company_isolation ON loads 
  FOR ALL
  USING (company_id = current_setting('app.current_company_id', true)::int);

ALTER TABLE weigh_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY weigh_tickets_company_isolation ON weigh_tickets 
  FOR ALL
  USING (company_id = current_setting('app.current_company_id', true)::int);

-- Create a function to set the company_id context
CREATE OR REPLACE FUNCTION set_company_context(company_id integer)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_company_id', company_id::text, false);
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION set_company_context TO prisma_app;

-- Comment explaining how to use this role with Prisma
COMMENT ON ROLE prisma_app IS 'Dedicated role for Prisma ORM with limited permissions for security';
