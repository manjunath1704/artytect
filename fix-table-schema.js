// Fix table schema by adding missing columns
const https = require('https');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

console.log('\n🔧 Table Schema Fix\n');
console.log('Project:', projectRef);
console.log('\n📋 You need to add these columns to your categories table:\n');
console.log('─'.repeat(80));
console.log(`
-- Step 1: Go to Supabase SQL Editor
-- Link: https://supabase.com/dashboard/project/${projectRef}/sql

-- Step 2: Click "New Query"

-- Step 3: Copy and paste this SQL:

ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS category_hover_thumbnail character varying;

ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS category_slug text;

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(category_slug);

-- Step 4: Click "Run" (or press Cmd/Ctrl + Enter)
`);
console.log('─'.repeat(80));
console.log('\n✅ After running the SQL:\n');
console.log('   1. The columns will be added to your table');
console.log('   2. Try creating a category again');
console.log('   3. Both images will upload and URLs will be stored\n');
console.log('💡 The error happens because Supabase needs these columns to exist');
console.log('   before it can insert data into them.\n');
