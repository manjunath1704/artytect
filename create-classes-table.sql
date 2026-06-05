-- ============================================================================
-- Classes Table (Removing Categories)
-- ============================================================================

CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT,
  content TEXT, -- Rich text content
  instructor_name TEXT,
  duration TEXT,
  class_date TEXT, -- Can store date/time as text or use TIMESTAMPTZ
  class_time TEXT,
  price INTEGER DEFAULT 0, -- Price in cents
  total_seats INTEGER DEFAULT 0,
  available_seats INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  gallery_images TEXT[], -- Array of image URLs
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  level TEXT, -- Beginner, Intermediate, Advanced, All levels
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Auto-update trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION update_classes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON classes
  FOR EACH ROW
  EXECUTE FUNCTION update_classes_updated_at();

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Public read access for published classes
CREATE POLICY "Public can read published classes"
  ON classes FOR SELECT
  USING (is_published = true);

-- Authenticated users can read all classes
CREATE POLICY "Authenticated users can read all classes"
  ON classes FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert classes
CREATE POLICY "Authenticated users can insert classes"
  ON classes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update classes
CREATE POLICY "Authenticated users can update classes"
  ON classes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users can delete classes
CREATE POLICY "Authenticated users can delete classes"
  ON classes FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- Indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_classes_slug ON classes(slug);
CREATE INDEX IF NOT EXISTS idx_classes_published ON classes(is_published);
CREATE INDEX IF NOT EXISTS idx_classes_featured ON classes(is_featured);
CREATE INDEX IF NOT EXISTS idx_classes_created_at ON classes(created_at DESC);

-- ============================================================================
-- Sample Data
-- ============================================================================

INSERT INTO classes (
  slug,
  title,
  short_description,
  content,
  instructor_name,
  duration,
  class_date,
  class_time,
  price,
  total_seats,
  available_seats,
  thumbnail_url,
  level,
  is_featured,
  is_published
) VALUES
(
  'wheel-throwing-basics',
  'Wheel Throwing Basics',
  'Learn centering, pulling, trimming, and glazing through calm weekly studio sessions.',
  '<p>A grounded introduction to the wheel for first-time makers and returning hands. You will move from clay preparation to finished fired pieces with close guidance at every stage.</p><p>Sessions are paced for hands-on practice, individual guidance, and enough quiet repetition to make the material feel familiar.</p>',
  'Jane Smith',
  '4 Weeks',
  '2024-07-15',
  '6:00 PM',
  2999,
  8,
  5,
  '/images/gallery/pexels-rdne-8903303.jpg',
  'Beginner',
  true,
  true
),
(
  'handbuilding-tableware',
  'Handbuilding Tableware',
  'Shape plates, bowls, and serving forms with pinch, coil, and slab techniques.',
  '<p>A tactile class for building useful tableware without the wheel. The pace is generous, the forms are functional, and every piece keeps the warmth of the maker''s hand.</p>',
  'John Doe',
  '3 Weeks',
  '2024-07-20',
  '4:00 PM',
  2499,
  10,
  7,
  '/images/gallery/pexels-readymade-3847467.jpg',
  'All levels',
  true,
  true
),
(
  'ceramic-surface-workshop',
  'Ceramic Surface Workshop',
  'Explore slips, carving, wax resist, and layered glazes for expressive ceramic surfaces.',
  '<p>A focused surface design workshop for people who already know basic clay handling and want to deepen the finish, texture, and visual language of their work.</p>',
  'Sarah Johnson',
  '1 Day',
  '2024-08-01',
  '10:00 AM',
  1899,
  12,
  10,
  '/images/gallery/pexels-karola-g-6805523.jpg',
  'Intermediate',
  true,
  true
),
(
  'glaze-application-workshop',
  'Glaze Application Workshop',
  'Explore slips, carving, wax resist, and layered glazes for expressive ceramic surfaces.',
  '<p>A focused surface design workshop for people who already know basic clay handling and want to deepen the finish, texture, and visual language of their work.</p>',
  'Sarah Johnson',
  '1 Day',
  '2024-08-05',
  '2:00 PM',
  1899,
  12,
  8,
  '/images/glazing.jpg',
  'Intermediate',
  true,
  true
);
