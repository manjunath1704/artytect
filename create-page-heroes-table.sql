-- Create page_hero_sections table for managing hero sections on
-- categories, classes, products, and blog pages
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS page_hero_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key TEXT NOT NULL UNIQUE,
  eyebrow TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  background_image_url TEXT NOT NULL DEFAULT '',
  button_label TEXT DEFAULT '',
  button_href TEXT DEFAULT '',
  sidebar_label TEXT DEFAULT '',
  sidebar_description TEXT DEFAULT '',
  sidebar_stat_1_value TEXT DEFAULT '',
  sidebar_stat_1_label TEXT DEFAULT '',
  sidebar_stat_2_value TEXT DEFAULT '',
  sidebar_stat_2_label TEXT DEFAULT '',
  sidebar_stat_3_value TEXT DEFAULT '',
  sidebar_stat_3_label TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default values for each page
INSERT INTO page_hero_sections (page_key, eyebrow, title, description, background_image_url, button_label, button_href, sidebar_label, sidebar_description, sidebar_stat_1_value, sidebar_stat_1_label, sidebar_stat_2_value, sidebar_stat_2_label, sidebar_stat_3_value, sidebar_stat_3_label)
VALUES
  (
    'categories',
    'categories',
    'Explore our ceramic forms',
    'Browse our curated collections of handmade pottery — bowls, vases, mugs, planters, plates, and serving forms shaped with calm lines, tactile finishes, and a studio-made sense of warmth.',
    '/images/gallery/pexels-karola-g-6805523.jpg',
    'Browse categories',
    '#collections',
    'categories',
    'Explore each collection to discover handcrafted pieces for your daily rituals and living spaces.',
    '',
    'categories',
    '100+',
    'Pieces',
    'WA',
    'Order'
  ),
  (
    'classes',
    'Pottery classes',
    'Make with clay, leave with ritual',
    'Small-format studio sessions for wheel throwing, handbuilding, glazing, and the slow confidence that comes from making by hand.',
    '/images/classes.jpg',
    '',
    '',
    'Classes',
    'Join our intimate studio sessions and discover the meditative art of pottery making.',
    '',
    'Classes',
    '12',
    'Max seats',
    '1-4',
    'Weeks'
  ),
  (
    'products',
    'Shop ceramics',
    'Objects for quiet daily living',
    'Bowls, plates, mugs, planters, and vessels shaped with calm lines, tactile finishes, and a studio-made sense of warmth.',
    '/images/gallery/pexels-readymade-3847457.jpg',
    'Browse catalog',
    '#catalog',
    'Pieces',
    'Discover our full range of handcrafted ceramic pieces across all categories.',
    '',
    'Pieces',
    '',
    'Forms',
    'WA',
    'Order'
  ),
  (
    'blog',
    'Studio journal',
    'Notes from the studio',
    'Stories on ceramic craft, material experiments, studio rituals, and the quiet details behind handmade earthware.',
    '/images/deep-b.avif',
    'View stories',
    '#stories',
    'Browse essays',
    'Explore process notes, kiln-side observations, and care guides from our ceramic practice.',
    '',
    '',
    '',
    '',
    '',
    ''
  )
ON CONFLICT (page_key) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE page_hero_sections ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read access for page_hero_sections"
  ON page_hero_sections
  FOR SELECT
  USING (true);

-- Allow authenticated users full access (admin only)
CREATE POLICY "Authenticated full access for page_hero_sections"
  ON page_hero_sections
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');