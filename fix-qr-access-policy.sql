-- ============================================
-- Fix admin_settings RLS Policy for Public Access
-- ============================================
-- This allows the checkout page to read the payment_qr setting
-- Run this in your Supabase SQL Editor

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Allow authenticated read on admin_settings" ON admin_settings;
DROP POLICY IF EXISTS "Allow authenticated update on admin_settings" ON admin_settings;
DROP POLICY IF EXISTS "Allow authenticated insert on admin_settings" ON admin_settings;

-- Create new policies

-- 1. Allow ANYONE (including non-authenticated users) to READ payment_qr
--    This is needed for the checkout page
CREATE POLICY "Allow public read payment_qr on admin_settings"
ON admin_settings
FOR SELECT
TO public
USING (key = 'payment_qr');

-- 2. Allow authenticated users to read ALL settings
CREATE POLICY "Allow authenticated read all on admin_settings"
ON admin_settings
FOR SELECT
TO authenticated
USING (true);

-- 3. Allow authenticated users to UPDATE settings
CREATE POLICY "Allow authenticated update on admin_settings"
ON admin_settings
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Allow authenticated users to INSERT settings
CREATE POLICY "Allow authenticated insert on admin_settings"
ON admin_settings
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Verify policies were created
SELECT 
  policyname,
  cmd,
  roles::text[],
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'admin_settings'
ORDER BY policyname;

-- Test: Try to read payment_qr (this should work now)
SELECT key, value FROM admin_settings WHERE key = 'payment_qr';
