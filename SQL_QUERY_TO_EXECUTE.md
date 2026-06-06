# SQL Query - Copy & Paste into Supabase

## 📋 Complete SQL Query to Execute

Copy the entire query below and paste it into your **Supabase SQL Editor**, then click **Execute**.

```sql
-- ============================================================================
-- FAQs Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Auto-update trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION update_faqs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_faqs_updated_at
  BEFORE UPDATE ON faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_faqs_updated_at();

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Public read access for active FAQs
CREATE POLICY "Public can read active FAQs"
  ON faqs FOR SELECT
  USING (is_active = true);

-- Authenticated users can read all FAQs
CREATE POLICY "Authenticated users can read all FAQs"
  ON faqs FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert FAQs
CREATE POLICY "Authenticated users can insert FAQs"
  ON faqs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update FAQs
CREATE POLICY "Authenticated users can update FAQs"
  ON faqs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users can delete FAQs
CREATE POLICY "Authenticated users can delete FAQs"
  ON faqs FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- Indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_faqs_is_active ON faqs(is_active);
CREATE INDEX IF NOT EXISTS idx_faqs_display_order ON faqs(display_order ASC);
CREATE INDEX IF NOT EXISTS idx_faqs_created_at ON faqs(created_at DESC);

-- ============================================================================
-- Sample Data
-- ============================================================================

INSERT INTO faqs (question, answer, display_order, is_active) VALUES
(
  'What materials do you use for your pottery?',
  'We work with high-quality ceramic clay sourced from trusted suppliers. Our clay is carefully selected for its workability and firing characteristics. We use both earthenware and stoneware depending on the project requirements.',
  10,
  true
),
(
  'Do you offer custom pottery commissions?',
  'Yes, we absolutely do! We love working on custom projects. Whether it''s bespoke tableware, decorative pieces, or functional art, we''d love to hear your ideas. Please contact us through our contact page to discuss your project in detail.',
  20,
  true
),
(
  'What is your typical turnaround time for orders?',
  'Standard orders typically take 2-4 weeks from order placement to delivery. Custom commissions may take longer depending on complexity and scope. Rush options are available for an additional fee. We''ll provide specific timelines when you place your order.',
  30,
  true
),
(
  'Do you offer workshops or classes?',
  'Yes! We offer both beginner and advanced pottery classes throughout the year. Our classes cover wheel throwing, hand-building, glazing techniques, and more. Check our Classes section for current offerings and enrollment information.',
  40,
  true
),
(
  'Are your products food-safe?',
  'All of our dinnerware and tableware products are food-safe and dishwasher safe. They''re glazed with food-grade glazes and properly fired. We''re proud that your meals look beautiful and stay protected in our pieces.',
  50,
  true
);
```

---

## 🚀 Steps to Execute

1. **Go to Supabase Dashboard**
   - Open https://app.supabase.com
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "+ New Query"

3. **Paste the SQL Query**
   - Copy the entire SQL query above
   - Paste it into the SQL Editor

4. **Execute**
   - Click the "Run" button (or press Ctrl+Enter)
   - Wait for "Success" message

5. **Verify**
   - Go to "Table Editor"
   - You should see "faqs" table
   - Click on it to see 5 sample FAQs

---

## ✅ What This Query Does

✓ Creates `faqs` table with columns:
  - `id`: Unique identifier
  - `question`: FAQ question
  - `answer`: FAQ answer
  - `display_order`: Sort order (10, 20, 30...)
  - `is_active`: Show/hide FAQ
  - `created_at`: Created timestamp
  - `updated_at`: Last updated timestamp

✓ Adds auto-update trigger for `updated_at`

✓ Enables Row Level Security (RLS)

✓ Creates RLS policies:
  - Public users: Read active FAQs only
  - Authenticated users: Full access

✓ Creates indexes for performance

✓ Inserts 5 sample FAQs

---

## 📌 What's Next

1. ✅ Execute this SQL query
2. ✅ Go to `/admin/faqs` to manage FAQs
3. ✅ FAQ section now shows on homepage (below Testimonials)
4. ✅ Create/edit/delete FAQs from admin panel

---

## 🎯 FAQ Section on Homepage

The FAQ section has been added to the homepage (`app/page.tsx`) and will:
- Display before the footer
- Show only active FAQs
- Automatically update as you manage FAQs in admin
- Be fully responsive on mobile/tablet/desktop

Happy FAQ'ing! 🚀
