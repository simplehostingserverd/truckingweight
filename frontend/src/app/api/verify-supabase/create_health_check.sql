-- Create a function to create the health_check table
CREATE OR REPLACE FUNCTION create_health_check_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create the health_check table if it doesn't exist
  CREATE TABLE IF NOT EXISTS health_check (
    id SERIAL PRIMARY KEY,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  
  -- Insert a test record
  INSERT INTO health_check (status) VALUES ('ok');
  
  -- Create RLS policy to allow anyone to select from the table
  DROP POLICY IF EXISTS "Health check is readable by everyone" ON health_check;
  CREATE POLICY "Health check is readable by everyone" ON health_check
    FOR SELECT
    USING (true);
    
  -- Enable RLS on the table
  ALTER TABLE health_check ENABLE ROW LEVEL SECURITY;
END;
$$;
