-- AGRON Supabase Database Setup Script
-- Run this in the Supabase SQL Editor to create all necessary tables

-- ============================================================================
-- SENSOR READINGS TABLE - Stores all IoT sensor data
-- ============================================================================

CREATE TABLE IF NOT EXISTS sensor_readings (
  id BIGSERIAL PRIMARY KEY,
  device_id VARCHAR(100) NOT NULL,
  timestamp BIGINT NOT NULL,
  temperature FLOAT NOT NULL,
  humidity FLOAT NOT NULL,
  soil_moisture JSONB NOT NULL DEFAULT '[]'::jsonb,
  light_intensity JSONB NOT NULL DEFAULT '[]'::jsonb,
  signal_strength INT DEFAULT 0,
  received_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_sensor_device_id ON sensor_readings(device_id);
CREATE INDEX IF NOT EXISTS idx_sensor_timestamp ON sensor_readings(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_device_timestamp ON sensor_readings(device_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_created_at ON sensor_readings(created_at DESC);

-- ============================================================================
-- DEVICE CONTROLS TABLE - Stores control state for each device
-- ============================================================================

CREATE TABLE IF NOT EXISTS device_controls (
  id BIGSERIAL PRIMARY KEY,
  device_id VARCHAR(100) NOT NULL UNIQUE,
  pump BOOLEAN DEFAULT false,
  growLight BOOLEAN DEFAULT false,
  fan1 BOOLEAN DEFAULT false,
  fan2 BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for fast device lookups
CREATE INDEX IF NOT EXISTS idx_controls_device_id ON device_controls(device_id);

-- ============================================================================
-- ALERTS TABLE (Optional) - For future alert/notification functionality
-- ============================================================================

CREATE TABLE IF NOT EXISTS alerts (
  id BIGSERIAL PRIMARY KEY,
  device_id VARCHAR(100) NOT NULL,
  alert_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'warning',
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_alerts_device_id ON alerts(device_id);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);

-- ============================================================================
-- DEVICE SETTINGS TABLE (Optional) - Store device configurations
-- ============================================================================

CREATE TABLE IF NOT EXISTS device_settings (
  id BIGSERIAL PRIMARY KEY,
  device_id VARCHAR(100) NOT NULL UNIQUE,
  device_name VARCHAR(255) DEFAULT 'AGRON Device',
  location VARCHAR(255),
  soil_dry_calibration INT DEFAULT 4095,
  soil_wet_calibration INT DEFAULT 2047,
  vwc_max FLOAT DEFAULT 60.0,
  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_settings_device_id ON device_settings(device_id);

-- ============================================================================
-- Enable Row Level Security (Optional - for multi-user support in future)
-- ============================================================================

-- ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE device_controls ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- VIEWS (Optional) - For easier data querying
-- ============================================================================

-- View: Get latest reading per device
CREATE OR REPLACE VIEW latest_readings AS
  SELECT DISTINCT ON (device_id) 
    device_id,
    timestamp,
    temperature,
    humidity,
    soil_moisture,
    light_intensity,
    signal_strength,
    received_at
  FROM sensor_readings
  ORDER BY device_id, timestamp DESC;

-- View: Get device summary (latest data + controls)
CREATE OR REPLACE VIEW device_summary AS
  SELECT 
    sr.device_id,
    sr.temperature,
    sr.humidity,
    sr.soil_moisture,
    sr.light_intensity,
    sr.signal_strength,
    sr.received_at,
    dc.pump,
    dc.growLight,
    dc.fan1,
    dc.fan2
  FROM latest_readings sr
  LEFT JOIN device_controls dc ON sr.device_id = dc.device_id;

-- ============================================================================
-- Print success message
-- ============================================================================
-- If using psql CLI: \echo 'AGRON Database setup complete!'
-- If using Supabase Studio: Tables are ready to use
