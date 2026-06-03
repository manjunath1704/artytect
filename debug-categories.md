# Debug Categories Issue

## Steps to Debug:

### 1. Check Database Categories
Run this in Supabase SQL Editor:
```sql
-- Check all categories
SELECT id, category_name, category_slug, parent_category_id 
FROM categories 
ORDER BY parent_category_id NULLS FIRST, category_name;

-- Check which are parent vs child
SELECT 
  CASE 
    WHEN parent_category_id IS NULL THEN 'PARENT' 
    ELSE 'CHILD' 
  END as type,
  category_name,
  category_slug,
  parent_category_id
FROM categories
ORDER BY parent_category_id NULLS FIRST, category_name;
```

### 2. Check Products
```sql
-- Check all products and their categories
SELECT id, name, category, status
FROM products
WHERE status = 'published'
ORDER BY category;

-- Check if product categories match child category names
SELECT DISTINCT p.category as product_category
FROM products p
LEFT JOIN categories c ON p.category = c.category_name
WHERE p.status = 'published';
```

### 3. Check Category Match
```sql
-- See if product categories match existing categories
SELECT 
  p.category as product_category,
  c.category_name as matching_category,
  c.parent_category_id,
  CASE 
    WHEN c.id IS NULL THEN 'NO MATCH'
    WHEN c.parent_category_id IS NULL THEN 'MATCHED PARENT (WRONG)'
    ELSE 'MATCHED CHILD (CORRECT)'
  END as match_status
FROM products p
LEFT JOIN categories c ON p.category = c.category_name
WHERE p.status = 'published';
```

### 4. Fix Product Categories (if needed)
If products have wrong category values, update them:

```sql
-- Example: If products have "Dinnerware" but should have "Bowls"
UPDATE products
SET category = 'Bowls'
WHERE category = 'Dinnerware';

-- Or update multiple products at once
-- First check what needs updating:
SELECT id, name, category
FROM products
WHERE status = 'published'
ORDER BY category;

-- Then update as needed
```

### 5. Test Query
```sql
-- Test the exact query used by the app
SELECT *
FROM products
WHERE status = 'published'
  AND category IN ('Bowls', 'Plates') -- Replace with your child category names
ORDER BY created_at DESC;
```

## Quick Fix:

If you see products but they have wrong category values:

1. Find your child category names (e.g., "Bowls", "Plates")
2. Update products to use those exact names
3. Refresh the category page

Example:
```sql
-- If "Bowls" is a child category and you have products:
UPDATE products SET category = 'Bowls' WHERE name LIKE '%bowl%';
UPDATE products SET category = 'Plates' WHERE name LIKE '%plate%';
```
