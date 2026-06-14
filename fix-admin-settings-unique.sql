-- ============================================================
-- Fix Duplicate Payment QR Settings and Enforce Uniqueness
-- ============================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/[project-id]/sql

-- 1. Clean up duplicate payment_qr rows by keeping only the latest updated one
DELETE FROM admin_settings 
WHERE key = 'payment_qr' 
  AND id NOT IN (
    SELECT id 
    FROM admin_settings 
    WHERE key = 'payment_qr' 
    ORDER BY updated_at DESC, created_at DESC, id DESC 
    LIMIT 1
  );

-- 2. Add a UNIQUE constraint to the 'key' column
-- This ensures no more duplicates can ever be inserted, and ON CONFLICT (key) DO UPDATE will work correctly.
ALTER TABLE admin_settings 
ADD CONSTRAINT admin_settings_key_unique UNIQUE (key);

-- 3. Verify the row count (should return exactly 1 row)
SELECT * FROM admin_settings WHERE key = 'payment_qr';
