-- Add missing columns to categories table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/qgjbonfvngwqujdbvist/sql

-- Add category_hover_thumbnail column
ALTER TABLE public.categories 
ADD COLUMN category_hover_thumbnail character varying;

-- Add category_slug column
ALTER TABLE public.categories 
ADD COLUMN category_slug text;

-- Create index on slug for better performance
CREATE INDEX idx_categories_slug ON public.categories(category_slug);

-- Reload the schema cache (this forces Supabase to recognize the new columns)
NOTIFY pgrst, 'reload schema';
