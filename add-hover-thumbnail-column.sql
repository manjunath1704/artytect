-- Add hover thumbnail column to categories table
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS category_hover_thumbnail character varying;

-- Also add a slug column for better URL handling
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS category_slug text;

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(category_slug);
