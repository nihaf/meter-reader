-- Create ENUM for measurement unit
CREATE TYPE unit_type AS ENUM (
  'm3',           -- Cubic meters (water, gas)
  'kWh',          -- Kilowatt hours (electricity)
  'l',            -- Liters (water)
  'unknown'       -- unknown
);

-- Create tables for meter counters
CREATE TABLE meter_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meter_id VARCHAR(255) NOT NULL,
  meter_type VARCHAR(50) NOT NULL,
  reading_value DECIMAL(10, 3) NOT NULL,
  unit unit_type,
  confidence VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries by meter_id and created_at
CREATE INDEX idx_meter_id ON meter_readings(meter_id);
CREATE INDEX idx_created_at ON meter_readings(created_at DESC);

-- Create view for newest reading per meter
CREATE VIEW latest_meter_readings AS
SELECT DISTINCT ON (meter_id) 
  id,
  meter_id,
  meter_type,
  reading_value,
  unit,
  confidence,
  created_at
FROM meter_readings
ORDER BY meter_id, created_at DESC;

-- Activate Row Level Security (optional but recommended)
ALTER TABLE meter_readings ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow read access to all" ON meter_readings
  FOR SELECT USING (true);

-- Create policy for Insert (optional - better authentication in production)
CREATE POLICY "Allow insert for authenticated users" ON meter_readings
  FOR INSERT WITH CHECK (true);