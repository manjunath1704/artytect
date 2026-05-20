// Setup Supabase database table
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

console.log('🔧 Setting up Supabase database...\n');

async function setupDatabase() {
  try {
    // Read SQL file
    const sql = fs.readFileSync('./create-categories-table.sql', 'utf8');
    
    console.log('1. Creating categories table...');
    
    // Execute SQL using Supabase REST API
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // If RPC doesn't exist, try direct table creation
      console.log('   Using direct table creation method...');
      
      // Create table using Supabase client
      const { error: createError } = await supabase
        .from('categories')
        .select('*')
        .limit(1);
      
      if (createError && createError.message.includes('does not exist')) {
        console.log('   ⚠️  Table does not exist. Please create it manually.');
        console.log('\n📋 Manual Setup Instructions:\n');
        console.log('1. Go to: https://supabase.com/dashboard/project/qgjbonfvngwqujdbvist/editor');
        console.log('2. Click "SQL Editor" in the left sidebar');
        console.log('3. Click "New Query"');
        console.log('4. Copy and paste the SQL from: create-categories-table.sql');
        console.log('5. Click "Run" or press Cmd/Ctrl + Enter');
        console.log('\nOr copy this SQL:\n');
        console.log('─'.repeat(60));
        console.log(sql);
        console.log('─'.repeat(60));
        return;
      }
      
      console.log('   ✓ Table already exists or was created');
    } else {
      console.log('   ✓ Table created successfully');
    }
    
    // Test the table
    console.log('\n2. Testing table access...');
    const { data: testData, error: testError } = await supabase
      .from('categories')
      .select('count', { count: 'exact', head: true });
    
    if (testError) {
      console.log('   ⚠️  Error accessing table:', testError.message);
      console.log('\n   Please create the table manually using the SQL above.');
    } else {
      console.log('   ✓ Table accessible');
      console.log('   ✓ Current categories count:', testData || 0);
    }
    
    // Check storage bucket
    console.log('\n3. Checking storage bucket...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.log('   ⚠️  Error checking buckets:', bucketError.message);
    } else {
      const hasBucket = buckets.some(b => b.name === 'category-thumbnails');
      if (hasBucket) {
        console.log('   ✓ category-thumbnails bucket exists');
      } else {
        console.log('   ℹ️  category-thumbnails bucket will be created on first upload');
      }
    }
    
    console.log('\n✅ Database setup complete!\n');
    console.log('🚀 Next steps:');
    console.log('   1. Start dev server: npm run dev');
    console.log('   2. Login to admin: http://localhost:3000/admin/login');
    console.log('   3. Create categories: http://localhost:3000/admin/create-categories');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n📋 Please create the table manually:');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Run the SQL from: create-categories-table.sql');
  }
}

setupDatabase();
