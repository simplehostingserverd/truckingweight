-- ScaleMasterAI Schema Extensions
-- This file contains the database schema extensions needed for the advanced trucking weight management system

-- Axle Configurations Table
CREATE TABLE IF NOT EXISTS axle_configurations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  axle_count INTEGER NOT NULL,
  configuration_type VARCHAR(50) NOT NULL,
  is_specialized BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Axles Table
CREATE TABLE IF NOT EXISTS axles (
  id SERIAL PRIMARY KEY,
  configuration_id INTEGER REFERENCES axle_configurations(id),
  position INTEGER NOT NULL,
  max_legal_weight INTEGER NOT NULL,
  description VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(configuration_id, position)
);

-- Vehicle Extensions
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS axle_configuration_id INTEGER REFERENCES axle_configurations(id),
ADD COLUMN IF NOT EXISTS empty_weight INTEGER,
ADD COLUMN IF NOT EXISTS max_gross_weight INTEGER,
ADD COLUMN IF NOT EXISTS height INTEGER,
ADD COLUMN IF NOT EXISTS width INTEGER,
ADD COLUMN IF NOT EXISTS length INTEGER,
ADD COLUMN IF NOT EXISTS telematics_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS eld_integration BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_inspection_date DATE;

-- Scale Facilities Table
CREATE TABLE IF NOT EXISTS scale_facilities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  company_id INTEGER REFERENCES companies(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scales Table
CREATE TABLE IF NOT EXISTS scales (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  facility_id INTEGER REFERENCES scale_facilities(id),
  scale_type VARCHAR(50) NOT NULL,
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100),
  max_capacity INTEGER NOT NULL,
  precision DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(10) DEFAULT 'lb',
  ip_address VARCHAR(45),
  port INTEGER,
  protocol VARCHAR(50),
  last_calibration_date DATE,
  next_calibration_date DATE,
  status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Maintenance', 'Out of Service')),
  company_id INTEGER REFERENCES companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced Weights Table (Weigh Tickets)
CREATE TABLE IF NOT EXISTS weigh_tickets (
  id SERIAL PRIMARY KEY,
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  vehicle_id INTEGER REFERENCES vehicles(id),
  driver_id INTEGER REFERENCES drivers(id),
  scale_id INTEGER REFERENCES scales(id),
  facility_id INTEGER REFERENCES scale_facilities(id),
  gross_weight INTEGER,
  tare_weight INTEGER,
  net_weight INTEGER,
  unit VARCHAR(10) DEFAULT 'lb',
  date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(50) DEFAULT 'Created' CHECK (status IN ('Created', 'Completed', 'Voided', 'Error')),
  compliance_status VARCHAR(50) CHECK (compliance_status IN ('Compliant', 'Warning', 'Non-Compliant')),
  capture_method VARCHAR(50) DEFAULT 'Scale' CHECK (capture_method IN ('Scale', 'IoT', 'Camera', 'Manual')),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  notes TEXT,
  company_id INTEGER REFERENCES companies(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Axle Weights Table
CREATE TABLE IF NOT EXISTS axle_weights (
  id SERIAL PRIMARY KEY,
  weigh_ticket_id INTEGER REFERENCES weigh_tickets(id),
  axle_position INTEGER NOT NULL,
  weight INTEGER NOT NULL,
  max_legal_weight INTEGER NOT NULL,
  compliance_status VARCHAR(50) CHECK (compliance_status IN ('Compliant', 'Warning', 'Non-Compliant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cargo Table
CREATE TABLE IF NOT EXISTS cargo (
  id SERIAL PRIMARY KEY,
  weigh_ticket_id INTEGER REFERENCES weigh_tickets(id),
  description TEXT NOT NULL,
  commodity_type VARCHAR(100),
  is_hazmat BOOLEAN DEFAULT FALSE,
  hazmat_class VARCHAR(50),
  volume DECIMAL(10, 2),
  volume_unit VARCHAR(10),
  density DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ticket Images Table
CREATE TABLE IF NOT EXISTS ticket_images (
  id SERIAL PRIMARY KEY,
  weigh_ticket_id INTEGER REFERENCES weigh_tickets(id),
  image_url TEXT NOT NULL,
  image_type VARCHAR(50) CHECK (image_type IN ('Vehicle', 'Cargo', 'Document')),
  captured_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ticket Signatures Table
CREATE TABLE IF NOT EXISTS ticket_signatures (
  id SERIAL PRIMARY KEY,
  weigh_ticket_id INTEGER REFERENCES weigh_tickets(id),
  signature_url TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100),
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Compliance Issues Table
CREATE TABLE IF NOT EXISTS compliance_issues (
  id SERIAL PRIMARY KEY,
  weigh_ticket_id INTEGER REFERENCES weigh_tickets(id),
  issue_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(50) CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  recommendation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scale Calibration History
CREATE TABLE IF NOT EXISTS scale_calibrations (
  id SERIAL PRIMARY KEY,
  scale_id INTEGER REFERENCES scales(id),
  calibration_date DATE NOT NULL,
  performed_by VARCHAR(255),
  certificate_number VARCHAR(100),
  notes TEXT,
  next_calibration_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scale Readings (for anomaly detection)
CREATE TABLE IF NOT EXISTS scale_readings (
  id SERIAL PRIMARY KEY,
  scale_id INTEGER REFERENCES scales(id),
  reading_value DECIMAL(10, 2) NOT NULL,
  reading_type VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_anomaly BOOLEAN DEFAULT FALSE,
  confidence_score DECIMAL(5, 2)
);

-- Load Optimization Suggestions
CREATE TABLE IF NOT EXISTS load_optimizations (
  id SERIAL PRIMARY KEY,
  weigh_ticket_id INTEGER REFERENCES weigh_tickets(id),
  original_distribution JSON,
  suggested_distribution JSON,
  expected_improvement DECIMAL(5, 2),
  explanation TEXT,
  applied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Predictive Alerts
CREATE TABLE IF NOT EXISTS predictive_alerts (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id),
  driver_id INTEGER REFERENCES drivers(id),
  alert_type VARCHAR(100) NOT NULL,
  risk_score DECIMAL(5, 2) NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on new tables
ALTER TABLE axle_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE axles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scale_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE weigh_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE axle_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE cargo ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE scale_calibrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scale_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictive_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables (company-based access)
CREATE POLICY "Axle configurations are viewable by company users" ON axle_configurations FOR SELECT USING (true);
CREATE POLICY "Axles are viewable by company users" ON axles FOR SELECT USING (true);

CREATE POLICY "Scale facilities are viewable by company users" ON scale_facilities
  FOR SELECT USING (company_id = (SELECT company_id FROM users WHERE id::text = auth.uid()::text));

CREATE POLICY "Scales are viewable by company users" ON scales
  FOR SELECT USING (company_id = (SELECT company_id FROM users WHERE id::text = auth.uid()::text));

CREATE POLICY "Weigh tickets are viewable by company users" ON weigh_tickets
  FOR SELECT USING (company_id = (SELECT company_id FROM users WHERE id::text = auth.uid()::text));

-- Add similar policies for other tables
