-- ============================================================================
-- Our Story Page Tables
-- ============================================================================

-- 1. Hero Section
CREATE TABLE IF NOT EXISTS our_story_hero (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  hero_image_url TEXT,
  hero_image_alt TEXT DEFAULT 'Our Story Hero Image',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Brand Story Section
CREATE TABLE IF NOT EXISTS our_story_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  who_we_are_title TEXT DEFAULT 'Who We Are',
  who_we_are_content TEXT,
  who_we_are_image_url TEXT,
  journey_title TEXT DEFAULT 'Our Journey',
  journey_content TEXT,
  journey_image_url TEXT,
  mission_title TEXT DEFAULT 'Our Mission',
  mission_content TEXT,
  vision_title TEXT DEFAULT 'Our Vision',
  vision_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Brand Values
CREATE TABLE IF NOT EXISTS our_story_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon_name TEXT, -- lucide icon name
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Timeline Items
CREATE TABLE IF NOT EXISTS our_story_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Founder/Team Members
CREATE TABLE IF NOT EXISTS our_story_team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Auto-update triggers
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_our_story_hero_updated_at
  BEFORE UPDATE ON our_story_hero
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_our_story_content_updated_at
  BEFORE UPDATE ON our_story_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_our_story_values_updated_at
  BEFORE UPDATE ON our_story_values
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_our_story_timeline_updated_at
  BEFORE UPDATE ON our_story_timeline
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_our_story_team_updated_at
  BEFORE UPDATE ON our_story_team
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS Policies (Read-only public access, admins can modify)
-- ============================================================================

ALTER TABLE our_story_hero ENABLE ROW LEVEL SECURITY;
ALTER TABLE our_story_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE our_story_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE our_story_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE our_story_team ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can read our_story_hero"
  ON our_story_hero FOR SELECT
  USING (true);

CREATE POLICY "Public can read our_story_content"
  ON our_story_content FOR SELECT
  USING (true);

CREATE POLICY "Public can read our_story_values"
  ON our_story_values FOR SELECT
  USING (true);

CREATE POLICY "Public can read our_story_timeline"
  ON our_story_timeline FOR SELECT
  USING (true);

CREATE POLICY "Public can read visible team members"
  ON our_story_team FOR SELECT
  USING (is_visible = true);

-- ============================================================================
-- Indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_our_story_values_sort_order ON our_story_values(sort_order);
CREATE INDEX IF NOT EXISTS idx_our_story_timeline_sort_order ON our_story_timeline(sort_order);
CREATE INDEX IF NOT EXISTS idx_our_story_team_sort_order ON our_story_team(sort_order);
CREATE INDEX IF NOT EXISTS idx_our_story_team_visible ON our_story_team(is_visible);

-- ============================================================================
-- Sample Data (Optional)
-- ============================================================================

INSERT INTO our_story_hero (title, subtitle, hero_image_url)
VALUES (
  'Our Story',
  'Crafting meaningful ceramics with tradition, soul, and purpose',
  '/images/our-story-hero.jpg'
) ON CONFLICT DO NOTHING;

INSERT INTO our_story_content (
  who_we_are_content,
  journey_content,
  mission_content,
  vision_content
)
VALUES (
  'We are a pottery studio dedicated to creating handmade ceramic pieces that bring warmth and beauty to everyday life.',
  'What started as a passion project in a small studio has grown into a thriving ceramic brand loved by collectors worldwide.',
  'To craft timeless ceramic pieces that inspire mindful living and connect people with the beauty of handmade artistry.',
  'To become a leading name in sustainable, handcrafted ceramics while preserving traditional pottery techniques.'
) ON CONFLICT DO NOTHING;

INSERT INTO our_story_values (title, description, icon_name, sort_order)
VALUES
  ('Quality', 'Every piece is crafted with meticulous attention to detail and superior materials.', 'award', 10),
  ('Creativity', 'We embrace artistic expression and innovative design in every creation.', 'palette', 20),
  ('Sustainability', 'Committed to eco-friendly practices and responsible sourcing.', 'leaf', 30),
  ('Customer First', 'Your satisfaction and experience are at the heart of everything we do.', 'heart', 40)
ON CONFLICT DO NOTHING;

INSERT INTO our_story_timeline (year, title, description, sort_order)
VALUES
  ('2018', 'The Beginning', 'Started pottery journey in a small home studio', 10),
  ('2020', 'First Collection', 'Launched our first ceramic collection', 20),
  ('2022', 'Growing Community', 'Reached 1000+ happy customers', 30),
  ('2024', 'Present Day', 'Continuing to create beautiful ceramic pieces', 40)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Add to public_page_visibility if not exists
-- ============================================================================

INSERT INTO public_page_visibility (page_key, is_visible)
VALUES ('our-story', true)
ON CONFLICT (page_key) DO NOTHING;
