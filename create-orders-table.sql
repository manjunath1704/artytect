-- ============================================
-- Create orders table with all required fields
-- ============================================
-- Copy and paste this entire script into Supabase SQL Editor and click "Run"

-- Create the orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  ordered_products JSONB NOT NULL,
  selected_sizes TEXT[] NOT NULL,
  selected_colors TEXT[] NOT NULL,
  quantities INTEGER[] NOT NULL,
  total_amount NUMERIC NOT NULL,
  payment_screenshot TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow authenticated users (admins) to read all orders
CREATE POLICY "Allow authenticated read all orders"
ON orders
FOR SELECT
TO authenticated
USING (true);

-- RLS Policy: Allow anyone to insert orders (for checkout)
CREATE POLICY "Allow public insert orders"
ON orders
FOR INSERT
TO public
WITH CHECK (true);

-- RLS Policy: Allow authenticated users (admins) to update orders
CREATE POLICY "Allow authenticated update orders"
ON orders
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- RLS Policy: Allow authenticated users (admins) to delete orders
CREATE POLICY "Allow authenticated delete orders"
ON orders
FOR DELETE
TO authenticated
USING (true);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();

-- Verify table creation
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM 
  information_schema.columns
WHERE 
  table_name = 'orders'
ORDER BY 
  ordinal_position;

-- Show table info
SELECT 
  'orders table created successfully!' AS message,
  COUNT(*) AS total_orders
FROM orders;
