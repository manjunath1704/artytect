-- Create contact_page table
CREATE TABLE IF NOT EXISTS public.contact_page (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_subtitle TEXT NOT NULL DEFAULT 'Contact us',
  hero_title TEXT NOT NULL DEFAULT 'Let''s shape something thoughtful',
  hero_description TEXT NOT NULL DEFAULT 'Reach out for custom pottery, collection questions, collaborations, or studio visits. We usually reply within one business day.',
  hero_image_url TEXT,
  email TEXT NOT NULL DEFAULT 'hello@Haritham.com',
  phone TEXT NOT NULL DEFAULT '+91 98765 43210',
  map_embed_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.contact_page ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow anyone to read
CREATE POLICY "Allow public read access on contact_page"
  ON public.contact_page
  FOR SELECT
  USING (true);

-- Create RLS policy to allow only authenticated users to insert
CREATE POLICY "Allow authenticated users to insert contact_page"
  ON public.contact_page
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create RLS policy to allow only authenticated users to update
CREATE POLICY "Allow authenticated users to update contact_page"
  ON public.contact_page
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_page_created_at ON public.contact_page(created_at DESC);

-- Add comment
COMMENT ON TABLE public.contact_page IS 'Stores contact page content including hero section and contact details';
