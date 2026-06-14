const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkPrices() {
  console.log('--- PRODUCTS (First 3) ---');
  const { data: products } = await supabase.from('products').select('id, name, price').limit(3);
  console.log(products);

  console.log('\n--- VARIANT SIZES (First 3) ---');
  const { data: sizes } = await supabase.from('variant_sizes').select('id, size, price').limit(3);
  console.log(sizes);

  console.log('\n--- CLASSES (First 3) ---');
  const { data: classes } = await supabase.from('classes').select('id, title, price').limit(3);
  console.log(classes);

  console.log('\n--- ORDERS (First 3) ---');
  const { data: orders } = await supabase.from('orders').select('id, order_id, total_amount').limit(3);
  console.log(orders);

  console.log('\n--- CLASS BOOKINGS (First 3) ---');
  const { data: bookings } = await supabase.from('class_bookings').select('id, booking_id, total_amount').limit(3);
  console.log(bookings);
}

checkPrices().catch(console.error);
