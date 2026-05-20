// Direct table creation using Supabase Management API
const https = require('https');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('❌ Could not extract project reference from URL');
  process.exit(1);
}

console.log('🔧 Creating categories table...\n');
console.log('Project:', projectRef);
console.log('URL:', supabaseUrl);
console.log('\n📋 Please create the table manually:\n');
console.log('1. Go to: https://supabase.com/dashboard/project/' + projectRef + '/sql');
console.log('2. Click "New Query"');
console.log('3. Copy and paste the SQL below');
console.log('4. Click "Run" or press Cmd/Ctrl + Enter\n');
console.log('─'.repeat(80));
console.log(`
-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  hover_thumbnail_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_created_at ON public.categories(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON public.categories
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated insert" ON public.categories
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON public.categories
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON public.categories
  FOR DELETE
  USING (auth.role() = 'authenticated');
`);
console.log('─'.repeat(80));
console.log('\n✅ After running the SQL, your admin panel will work!\n');
