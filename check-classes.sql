-- Check published classes
SELECT 
  id,
  title,
  slug,
  is_published,
  created_at
FROM classes
ORDER BY created_at DESC
LIMIT 10;

-- Check public_page_visibility for classes
SELECT 
  page_key,
  is_visible,
  sort_order
FROM public_page_visibility
WHERE page_key = 'classes';
