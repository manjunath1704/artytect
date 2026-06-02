-- ============================================
-- Create admin_settings table for Payment QR
-- ============================================
-- Run this in your Supabase SQL Editor

-- Create the admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on key for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(key);

-- Insert default payment_qr setting (empty initially)
INSERT INTO admin_settings (key, value)
VALUES ('payment_qr', '{"url": ""}')
ON CONFLICT (key) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policy: Allow authenticated users to read
CREATE POLICY "Allow authenticated read on admin_settings"
ON admin_settings
FOR SELECT
TO authenticated
USING (true);

-- Create policy: Allow authenticated users to update
CREATE POLICY "Allow authenticated update on admin_settings"
ON admin_settings
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policy: Allow authenticated users to insert
CREATE POLICY "Allow authenticated insert on admin_settings"
ON admin_settings
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Optional: Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
DROP TRIGGER IF EXISTS admin_settings_updated_at ON admin_settings;
CREATE TRIGGER admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_settings_updated_at();

-- Verify the table was created
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM 
  information_schema.columns
WHERE 
  table_name = 'admin_settings'
ORDER BY 
  ordinal_position;

-- Show current settings
SELECT * FROM admin_settings;
