// Check what columns actually exist
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('\n🔍 Checking what columns exist in categories table...\n');

async function checkColumns() {
  // Try inserting with only the columns we know exist
  const minimalData = {
    category_name: 'Test',
    category_description: 'Test description',
    category_thumbnail: 'https://example.com/test.jpg',
    category_thumbnail_alt: 'Test'
  };

  console.log('Testing with minimal columns:', Object.keys(minimalData).join(', '));
  const { data, error } = await supabase
    .from('categories')
    .insert(minimalData)
    .select()
    .single();

  if (error) {
    console.log('\n❌ Error:', error.message);
  } else {
    console.log('\n✅ Success! These columns exist:', Object.keys(data).join(', '));
    
    // Clean up
    await supabase.from('categories').delete().eq('id', data.id);
    console.log('✅ Test data cleaned up\n');
  }
}

checkColumns();
