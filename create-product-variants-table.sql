-- Create product_variants and variant_sizes tables
-- Run this in your Supabase SQL Editor

-- Product variants table (color variants)
-- Uses BIGINT for product_id to match the products.id column type
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_name TEXT NOT NULL,
  color_code TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Variant sizes table (size + price + stock per color variant)
CREATE TABLE IF NOT EXISTS variant_sizes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  compare_at_price NUMERIC DEFAULT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(variant_id, size)
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variant_sizes_variant_id ON variant_sizes(variant_id);

-- Enable RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE variant_sizes ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read access for product_variants"
  ON product_variants FOR SELECT USING (true);

CREATE POLICY "Public read access for variant_sizes"
  ON variant_sizes FOR SELECT USING (true);

-- Allow authenticated users full access (admin)
CREATE POLICY "Authenticated full access for product_variants"
  ON product_variants FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access for variant_sizes"
  ON variant_sizes FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');