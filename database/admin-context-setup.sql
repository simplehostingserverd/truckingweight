-- SQL script to add admin context function for bypassing RLS
-- Run this in the Supabase SQL Editor

-- Create a function to set the admin context
CREATE OR REPLACE FUNCTION set_admin_context(is_admin boolean)
RETURNS void AS $$
BEGIN
  -- Set a session variable to indicate admin status
  PERFORM set_config('app.is_admin', is_admin::text, false);
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the function to the prisma_app role
GRANT EXECUTE ON FUNCTION set_admin_context TO prisma_app;

-- Update RLS policies to check for admin context
-- For the companies table
DROP POLICY IF EXISTS companies_isolation ON companies;
CREATE POLICY companies_isolation ON companies 
  FOR ALL
  USING (
    company_id = current_setting('app.current_company_id', true)::int
    OR current_setting('app.is_admin', true)::boolean = true
  );

-- For the users table
DROP POLICY IF EXISTS users_company_isolation ON users;
CREATE POLICY users_company_isolation ON users 
  FOR ALL
  USING (
    company_id = current_setting('app.current_company_id', true)::int
    OR current_setting('app.is_admin', true)::boolean = true
  );

-- For the drivers table
DROP POLICY IF EXISTS drivers_company_isolation ON drivers;
CREATE POLICY drivers_company_isolation ON drivers 
  FOR ALL
  USING (
    company_id = current_setting('app.current_company_id', true)::int
    OR current_setting('app.is_admin', true)::boolean = true
  );

-- For the vehicles table
DROP POLICY IF EXISTS vehicles_company_isolation ON vehicles;
CREATE POLICY vehicles_company_isolation ON vehicles 
  FOR ALL
  USING (
    company_id = current_setting('app.current_company_id', true)::int
    OR current_setting('app.is_admin', true)::boolean = true
  );

-- For the loads table
DROP POLICY IF EXISTS loads_company_isolation ON loads;
CREATE POLICY loads_company_isolation ON loads 
  FOR ALL
  USING (
    company_id = current_setting('app.current_company_id', true)::int
    OR current_setting('app.is_admin', true)::boolean = true
  );

-- For the weights table
DROP POLICY IF EXISTS weights_company_isolation ON weights;
CREATE POLICY weights_company_isolation ON weights 
  FOR ALL
  USING (
    company_id = current_setting('app.current_company_id', true)::int
    OR current_setting('app.is_admin', true)::boolean = true
  );

-- For the weigh_tickets table
DROP POLICY IF EXISTS weigh_tickets_company_isolation ON weigh_tickets;
CREATE POLICY weigh_tickets_company_isolation ON weigh_tickets 
  FOR ALL
  USING (
    company_id = current_setting('app.current_company_id', true)::int
    OR current_setting('app.is_admin', true)::boolean = true
  );

-- Comment explaining the purpose of this script
COMMENT ON FUNCTION set_admin_context IS 'Function to set admin context for bypassing RLS policies';

-- Insert some dummy data for testing if it doesn't exist
DO $$
DECLARE
  company_count INTEGER;
BEGIN
  -- Check if we already have companies
  SELECT COUNT(*) INTO company_count FROM companies;
  
  -- Only insert dummy data if we have fewer than 3 companies
  IF company_count < 3 THEN
    -- Insert dummy companies
    INSERT INTO companies (name, address, contact_email, contact_phone)
    VALUES 
      ('ABC Trucking', '123 Main St, Anytown, USA', 'contact@abctrucking.com', '555-123-4567'),
      ('XYZ Logistics', '456 Oak Ave, Somewhere, USA', 'info@xyzlogistics.com', '555-987-6543'),
      ('FastFreight Inc', '789 Pine Rd, Nowhere, USA', 'support@fastfreight.com', '555-456-7890');
      
    -- Insert dummy vehicles for each company
    INSERT INTO vehicles (name, make, model, year, license_plate, status, company_id)
    VALUES
      ('Truck 101', 'Peterbilt', '579', 2022, 'ABC123', 'Active', 1),
      ('Truck 102', 'Kenworth', 'T680', 2021, 'XYZ456', 'Active', 1),
      ('Truck 201', 'Freightliner', 'Cascadia', 2023, 'DEF789', 'Active', 2),
      ('Truck 202', 'Volvo', 'VNL', 2022, 'GHI012', 'Active', 2),
      ('Truck 301', 'Mack', 'Anthem', 2021, 'JKL345', 'Active', 3),
      ('Truck 302', 'International', 'LT', 2023, 'MNO678', 'Active', 3);
      
    -- Insert dummy drivers for each company
    INSERT INTO drivers (name, license_number, license_expiry, phone, email, status, company_id)
    VALUES
      ('John Doe', 'DL12345', '2025-12-31', '555-111-2222', 'john@abctrucking.com', 'Active', 1),
      ('Jane Smith', 'DL67890', '2024-06-30', '555-333-4444', 'jane@abctrucking.com', 'Active', 1),
      ('Bob Johnson', 'DL24680', '2025-03-15', '555-555-6666', 'bob@xyzlogistics.com', 'Active', 2),
      ('Alice Brown', 'DL13579', '2024-09-22', '555-777-8888', 'alice@xyzlogistics.com', 'Active', 2),
      ('Charlie Wilson', 'DL97531', '2025-05-18', '555-999-0000', 'charlie@fastfreight.com', 'Active', 3),
      ('Diana Miller', 'DL86420', '2024-11-05', '555-222-3333', 'diana@fastfreight.com', 'Active', 3);
      
    -- Insert dummy weights for each company
    INSERT INTO weights (vehicle_id, driver_id, weight, date, time, status, company_id)
    VALUES
      (1, 1, '32,500 lbs', CURRENT_DATE - INTERVAL '7 days', '09:30:00', 'Compliant', 1),
      (2, 2, '34,200 lbs', CURRENT_DATE - INTERVAL '5 days', '14:15:00', 'Warning', 1),
      (1, 1, '33,100 lbs', CURRENT_DATE - INTERVAL '2 days', '11:45:00', 'Compliant', 1),
      (3, 3, '36,800 lbs', CURRENT_DATE - INTERVAL '6 days', '10:20:00', 'Non-Compliant', 2),
      (4, 4, '31,900 lbs', CURRENT_DATE - INTERVAL '4 days', '13:10:00', 'Compliant', 2),
      (3, 3, '35,500 lbs', CURRENT_DATE - INTERVAL '1 day', '15:30:00', 'Warning', 2),
      (5, 5, '37,200 lbs', CURRENT_DATE - INTERVAL '8 days', '08:45:00', 'Non-Compliant', 3),
      (6, 6, '33,700 lbs', CURRENT_DATE - INTERVAL '3 days', '12:20:00', 'Compliant', 3),
      (5, 5, '34,900 lbs', CURRENT_DATE, '09:15:00', 'Warning', 3);
      
    -- Insert dummy loads for each company
    INSERT INTO loads (description, origin, destination, weight, status, vehicle_id, driver_id, company_id)
    VALUES
      ('Furniture Delivery', 'Chicago, IL', 'Detroit, MI', '15,000 lbs', 'In Transit', 1, 1, 1),
      ('Electronics Shipment', 'New York, NY', 'Boston, MA', '12,500 lbs', 'Pending', 2, 2, 1),
      ('Construction Materials', 'Dallas, TX', 'Houston, TX', '18,200 lbs', 'Delivered', 3, 3, 2),
      ('Food Products', 'Miami, FL', 'Atlanta, GA', '14,800 lbs', 'In Transit', 4, 4, 2),
      ('Automotive Parts', 'Los Angeles, CA', 'Phoenix, AZ', '16,300 lbs', 'Pending', 5, 5, 3),
      ('Medical Supplies', 'Seattle, WA', 'Portland, OR', '11,900 lbs', 'Delivered', 6, 6, 3);
  END IF;
END $$;
