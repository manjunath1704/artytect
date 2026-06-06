-- Fix classes page visibility (set to true/visible)
UPDATE public.public_page_visibility
SET is_visible = true
WHERE page_key = 'classes';

-- Verify the update
SELECT page_key, label, path, is_visible, sort_order
FROM public.public_page_visibility
WHERE page_key = 'classes';
