// Verify table structure
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('\n🔍 Checking categories table structure...\n');

async function checkTable() {
  // Try to insert a test row to see what columns are expected
  const testData = {
    category_name: 'Test',
    category_slug: 'test',
    category_description: 'Test description',
    category_thumbnail: 'https://example.com/test.jpg',
    category_hover_thumbnail: 'https://example.com/test-hover.jpg',
    category_thumbnail_alt: 'Test'
  };

  console.log('Attempting to insert test data...');
  const { data, error } = await supabase
    .from('categories')
    .insert(testData)
    .select()
    .single();

  if (error) {
    console.log('\n❌ Error:', error.message);
    console.log('\nError details:', JSON.stringify(error, null, 2));
    
    if (error.message.includes('schema cache')) {
      console.log('\n💡 This means the column does not exist in your table.');
      console.log('\n📋 Please verify you ran the SQL in Supabase Dashboard:');
      console.log('   1. Go to: https://supabase.com/dashboard/project/qgjbonfvngwqujdbvist/sql');
      console.log('   2. Run the ALTER TABLE commands');
      console.log('   3. Check for success message\n');
    }
  } else {
    console.log('\n✅ Success! Test row inserted:', data);
    console.log('\n🧹 Cleaning up test data...');
    
    // Delete the test row
    await supabase
      .from('categories')
      .delete()
      .eq('id', data.id);
    
    console.log('✅ Test data removed');
    console.log('\n✨ Your table is ready! You can now create categories.\n');
  }
}

checkTable();
