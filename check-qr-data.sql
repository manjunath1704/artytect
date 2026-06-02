-- Run this in Supabase SQL Editor to check your QR data

-- Check if admin_settings table exists and has data
SELECT 
  id,
  key,
  value,
  created_at,
  updated_at
FROM admin_settings
WHERE key = 'payment_qr';

-- If you see the data, check the value column format
-- It should look like: {"url": "https://..."}

-- If the URL is there but not showing on checkout, check:
-- 1. Is the URL accessible? Copy the URL and paste in browser
-- 2. Check RLS policies (run next query)

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'admin_settings';
