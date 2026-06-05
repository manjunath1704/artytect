# Contact Page Admin Management Setup

## What Was Done

I've created a complete admin panel to manage the contact page content from Supabase, including:

### Files Created:

1. **Admin Page**: `/app/admin/contact/page.tsx`
   - Server-side page that fetches contact data from Supabase
   - Handles authentication check
   - Passes initial data to the manager component

2. **Admin Manager Component**: `/app/admin/contact/contact-manager.tsx`
   - UI for editing hero section (subtitle, title, description)
   - UI for editing contact details (email, phone)
   - UI for managing map embed URL
   - Image upload for hero section
   - Real-time preview of current content
   - Animated form with Framer Motion

3. **API Routes**:
   - `POST /api/admin/contact` - Create new contact page data
   - `PUT /api/admin/contact/[id]` - Update existing contact page data
   - `GET /api/contact-page` - Fetch contact page data (public endpoint used by contact page)

4. **Updated Files**:
   - `/app/contact/page.tsx` - Now fetches data from admin panel
   - `/app/components/contact-map.tsx` - Updated to accept embedUrl prop from admin

### Features:

✓ **Hero Section Management**
  - Subtitle, title, description text editing
  - Hero image upload with drag-and-drop
  - Image preview in form

✓ **Contact Details**
  - Email address management
  - Phone number management

✓ **Map Integration**
  - Map embed URL field (for Google Maps iframe src)
  - Dynamically loads map on contact page

✓ **Image Upload**
  - Drag and drop interface
  - Uploads to Supabase storage
  - Uses existing ImageUploader component

✓ **UI/UX**
  - Animated form appearance/disappearance
  - Current content preview section
  - Responsive layout
  - Matches design system colors and styling

---

## SQL Query to Execute in Supabase

Copy and paste the following SQL into Supabase SQL Editor to create the required table:

```sql
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
```

---

## Steps to Use

1. **Execute SQL Query**: Run the SQL query above in Supabase SQL Editor
2. **Access Admin Panel**: Navigate to `/admin/contact` in the admin panel
3. **Edit Content**: Click "Edit content" button to open the form
4. **Update Details**:
   - Edit hero section (subtitle, title, description)
   - Upload new hero image
   - Update email and phone
   - Add Google Maps embed URL (if needed)
5. **Save**: Click "Save changes" to persist to database
6. **View on Frontend**: Contact page will automatically use the updated data

---

## Map Embed URL

To get the Google Maps embed URL:
1. Go to [Google Maps](https://maps.google.com)
2. Search for your location
3. Click "Share" button
4. Select "Embed a map" tab
5. Copy the `src` attribute value from the iframe
6. Paste it into the "Map Embed URL" field in the admin panel

Example format:
```
https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d...
```

---

## Table Structure

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key, auto-generated |
| `hero_subtitle` | TEXT | Hero section subtitle |
| `hero_title` | TEXT | Hero section main title |
| `hero_description` | TEXT | Hero section description text |
| `hero_image_url` | TEXT | URL to hero image in Supabase storage |
| `email` | TEXT | Contact email address |
| `phone` | TEXT | Contact phone number |
| `map_embed_url` | TEXT | Google Maps iframe embed URL |
| `created_at` | TIMESTAMP | Auto-generated creation timestamp |
| `updated_at` | TIMESTAMP | Auto-generated update timestamp |

---

## Frontend Updates

The public contact page (`/contact`) will:
- Fetch data from `/api/contact-page` endpoint
- Display all hero section text from the database
- Show hero image uploaded via admin
- Use email/phone from database in contact methods
- Display map if embed URL is provided
- Fall back to defaults if no data exists

All changes made in the admin panel are immediately reflected on the public contact page.
