-- Supabase SQL Editor Script
-- Set up Storage Buckets and policies for managing Hero section videos and images

-- 1. Create hero-media bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hero-media', 
  'hero-media', 
  true, 
  52428800, -- 50MB limit for video files
  ARRAY['image/*', 'video/*']
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Allow public read access to hero-media bucket
DROP POLICY IF EXISTS "Public can read hero-media" ON storage.objects;
CREATE POLICY "Public can read hero-media"
ON storage.objects
FOR SELECT
USING (bucket_id = 'hero-media');

-- 3. Allow authenticated users (admins) to upload to hero-media bucket
DROP POLICY IF EXISTS "Authenticated can upload hero-media" ON storage.objects;
CREATE POLICY "Authenticated can upload hero-media"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'hero-media' AND auth.role() = 'authenticated');

-- 4. Allow authenticated users (admins) to update hero-media bucket
DROP POLICY IF EXISTS "Authenticated can update hero-media" ON storage.objects;
CREATE POLICY "Authenticated can update hero-media"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'hero-media' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'hero-media' AND auth.role() = 'authenticated');

-- 5. Allow authenticated users (admins) to delete from hero-media bucket
DROP POLICY IF EXISTS "Authenticated can delete hero-media" ON storage.objects;
CREATE POLICY "Authenticated can delete hero-media"
ON storage.objects
FOR DELETE
USING (bucket_id = 'hero-media' AND auth.role() = 'authenticated');
