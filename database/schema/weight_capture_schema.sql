-- Weight Capture System Schema Extensions

-- Scales table to store information about physical scales
CREATE TABLE IF NOT EXISTS scales (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  scale_type VARCHAR(50) NOT NULL, -- 'full_platform', 'axle', 'portable', etc.
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100),
  max_capacity DECIMAL(10, 2), -- in pounds or kg
  precision DECIMAL(5, 2), -- precision of the scale
  calibration_date DATE,
  next_calibration_date DATE,
  api_endpoint VARCHAR(255), -- For IoT scales with API endpoints
  api_key VARCHAR(255), -- Encrypted API key for the scale
  qr_code_uuid UUID DEFAULT uuid_generate_v4(), -- Unique identifier for QR code
  company_id INTEGER REFERENCES companies(id),
  status VARCHAR(50) DEFAULT 'Active', -- 'Active', 'Maintenance', 'Offline'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on company_id
CREATE INDEX IF NOT EXISTS idx_scales_company_id ON scales(company_id);

-- Create index on qr_code_uuid
CREATE INDEX IF NOT EXISTS idx_scales_qr_code_uuid ON scales(qr_code_uuid);

-- Axle configurations table
CREATE TABLE IF NOT EXISTS axle_configurations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  axle_count INTEGER NOT NULL,
  configuration_type VARCHAR(50) NOT NULL, -- 'single', 'tandem', 'tridem', 'custom'
  max_weight_per_axle DECIMAL(10, 2), -- Maximum legal weight per axle
  company_id INTEGER REFERENCES companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on company_id
CREATE INDEX IF NOT EXISTS idx_axle_configurations_company_id ON axle_configurations(company_id);

-- Axle weights table to store individual axle measurements
CREATE TABLE IF NOT EXISTS axle_weights (
  id SERIAL PRIMARY KEY,
  weight_id INTEGER REFERENCES weights(id) ON DELETE CASCADE,
  axle_number INTEGER NOT NULL, -- 1, 2, 3, etc.
  axle_weight DECIMAL(10, 2) NOT NULL, -- Weight of this specific axle
  axle_type VARCHAR(50), -- 'steering', 'drive', 'trailer', etc.
  is_compliant BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on weight_id
CREATE INDEX IF NOT EXISTS idx_axle_weights_weight_id ON axle_weights(weight_id);

-- Weigh tickets table to store detailed ticket information
CREATE TABLE IF NOT EXISTS weigh_tickets (
  id SERIAL PRIMARY KEY,
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  weight_id INTEGER REFERENCES weights(id) ON DELETE CASCADE,
  scale_id INTEGER REFERENCES scales(id),
  gross_weight DECIMAL(10, 2) NOT NULL,
  tare_weight DECIMAL(10, 2),
  net_weight DECIMAL(10, 2),
  weigh_type VARCHAR(50) NOT NULL, -- 'gross_only', 'tare_only', 'gross_tare', 'split_weigh'
  weigh_method VARCHAR(50) NOT NULL, -- 'scale_api', 'manual_entry', 'camera_scan', 'iot_sensor'
  ticket_image_url VARCHAR(255), -- URL to the stored ticket image
  signature_image_url VARCHAR(255), -- URL to the stored signature image
  notes TEXT,
  is_certified BOOLEAN DEFAULT FALSE,
  certified_by VARCHAR(100),
  certified_at TIMESTAMP WITH TIME ZONE,
  company_id INTEGER REFERENCES companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on weight_id
CREATE INDEX IF NOT EXISTS idx_weigh_tickets_weight_id ON weigh_tickets(weight_id);

-- Create index on company_id
CREATE INDEX IF NOT EXISTS idx_weigh_tickets_company_id ON weigh_tickets(company_id);

-- Create index on ticket_number
CREATE INDEX IF NOT EXISTS idx_weigh_tickets_ticket_number ON weigh_tickets(ticket_number);

-- Scale readings table to store raw data from scales
CREATE TABLE IF NOT EXISTS scale_readings (
  id SERIAL PRIMARY KEY,
  scale_id INTEGER REFERENCES scales(id),
  reading_value DECIMAL(10, 2) NOT NULL,
  reading_type VARCHAR(50) NOT NULL, -- 'gross', 'tare', 'axle', 'test'
  reading_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reading_source VARCHAR(50) NOT NULL, -- 'api', 'manual', 'iot', 'camera'
  raw_data JSONB, -- Store raw data from the scale for debugging/auditing
  processed BOOLEAN DEFAULT FALSE,
  weight_id INTEGER REFERENCES weights(id),
  company_id INTEGER REFERENCES companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on scale_id
CREATE INDEX IF NOT EXISTS idx_scale_readings_scale_id ON scale_readings(scale_id);

-- Create index on company_id
CREATE INDEX IF NOT EXISTS idx_scale_readings_company_id ON scale_readings(company_id);

-- Create index on weight_id
CREATE INDEX IF NOT EXISTS idx_scale_readings_weight_id ON scale_readings(weight_id);

-- Scale calibration logs
CREATE TABLE IF NOT EXISTS scale_calibrations (
  id SERIAL PRIMARY KEY,
  scale_id INTEGER REFERENCES scales(id),
  calibration_date DATE NOT NULL,
  performed_by VARCHAR(100) NOT NULL,
  certification_number VARCHAR(100),
  notes TEXT,
  passed BOOLEAN NOT NULL,
  company_id INTEGER REFERENCES companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on scale_id
CREATE INDEX IF NOT EXISTS idx_scale_calibrations_scale_id ON scale_calibrations(scale_id);

-- Create index on company_id
CREATE INDEX IF NOT EXISTS idx_scale_calibrations_company_id ON scale_calibrations(company_id);

-- Add RLS policies for the new tables
ALTER TABLE scales ENABLE ROW LEVEL SECURITY;
CREATE POLICY scales_isolation ON scales 
  FOR ALL
  USING (
    company_id = current_setting('app.current_company_id', true)::int
    OR current_setting('app.is_admin', true)::boolean = true
  );

ALTER TABLE axle_configurations ENABLE ROW LEVEL SECURITY;
CREATE POLICY axle_configurations_isolation ON axle_configurations 
  FOR ALL
  USING (
    company_id = current_setting('app.current_company_id', true)::int
    OR current_setting('app.is_admin', true)::boolean = true
  );

ALTER TABLE weigh_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY weigh_tickets_isolation ON weigh_tickets 
  FOR ALL
  USING (
    company_id = current_setting('app.current_company_id', true)::int
    OR current_setting('app.is_admin', true)::boolean = true
  );

ALTER TABLE scale_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY scale_readings_isolation ON scale_readings 
  FOR ALL
  USING (
    company_id = current_setting('app.current_company_id', true)::int
    OR current_setting('app.is_admin', true)::boolean = true
  );

ALTER TABLE scale_calibrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY scale_calibrations_isolation ON scale_calibrations 
  FOR ALL
  USING (
    company_id = current_setting('app.current_company_id', true)::int
    OR current_setting('app.is_admin', true)::boolean = true
  );

-- Grant permissions to the prisma_app role
GRANT SELECT, INSERT, UPDATE, DELETE ON scales TO prisma_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON axle_configurations TO prisma_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON axle_weights TO prisma_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON weigh_tickets TO prisma_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON scale_readings TO prisma_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON scale_calibrations TO prisma_app;

-- Grant usage on sequences
GRANT USAGE, SELECT ON SEQUENCE scales_id_seq TO prisma_app;
GRANT USAGE, SELECT ON SEQUENCE axle_configurations_id_seq TO prisma_app;
GRANT USAGE, SELECT ON SEQUENCE axle_weights_id_seq TO prisma_app;
GRANT USAGE, SELECT ON SEQUENCE weigh_tickets_id_seq TO prisma_app;
GRANT USAGE, SELECT ON SEQUENCE scale_readings_id_seq TO prisma_app;
GRANT USAGE, SELECT ON SEQUENCE scale_calibrations_id_seq TO prisma_app;
