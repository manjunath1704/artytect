-- Add sample measurement data to existing products
-- Run this in your Supabase SQL editor to populate measurement_table for testing

UPDATE products
SET measurement_table = '[
  {"label": "S", "height": "18 cm", "width": "18 cm", "length": "6 cm"},
  {"label": "M", "height": "20 cm", "width": "20 cm", "length": "8 cm"},
  {"label": "L", "height": "22 cm", "width": "22 cm", "length": "10 cm"},
  {"label": "XL", "height": "24 cm", "width": "24 cm", "length": "12 cm"}
]'::jsonb
WHERE measurement_table IS NULL OR measurement_table = '[]'::jsonb;

-- Verify the update
SELECT id, name, measurement_table FROM products LIMIT 5;
