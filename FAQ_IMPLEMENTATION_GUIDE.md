# FAQ Section Implementation Guide

This guide covers the complete FAQ section implementation for Artytect, including the database schema, API routes, admin management, and public website display.

## 📋 Overview

The FAQ system includes:
- **Database**: PostgreSQL table with RLS policies
- **Admin Dashboard**: Full CRUD management for FAQs
- **Public Page**: Responsive accordion component with smooth animations
- **API Routes**: Secure admin endpoints + public read endpoint
- **TypeScript**: Full type safety with reusable types

## 🗄️ Database Setup

### 1. Create the FAQs Table

Run this SQL query in your Supabase dashboard:

```sql
-- File: create-faqs-table.sql
-- This creates the FAQs table with all necessary fields and policies
```

Execute this in Supabase SQL Editor to set up:
- `faqs` table with columns: `id`, `question`, `answer`, `display_order`, `is_active`, `created_at`, `updated_at`
- Auto-update trigger for `updated_at`
- Row Level Security (RLS) policies
- Indexes for performance

### 2. Sample Data

The SQL file includes 5 sample FAQs. Adjust these to match your content.

## 📁 File Structure

```
app/
├── api/
│   ├── admin/faqs/
│   │   ├── route.ts          # GET, POST - fetch/create FAQs
│   │   └── [id]/route.ts     # PUT, DELETE - update/delete FAQs
│   └── faqs/
│       └── route.ts          # GET - public API (active FAQs only)
├── admin/
│   └── faqs/
│       ├── faqs-manager.tsx  # Admin CRUD manager
│       └── page.tsx          # Admin page wrapper
└── components/home/
    ├── faq-section.tsx        # Public FAQ accordion component
    └── faq-section-skeleton.tsx  # Loading skeleton

lib/
└── faqs.ts                    # TypeScript types and constants
```

## 🚀 Admin Features

### Accessing the FAQ Admin Panel

1. Log in to admin dashboard
2. Click **FAQs** in the sidebar (look for the Help Circle icon)
3. You'll see the FAQ management interface

### Admin Actions

#### Create FAQ
- Click **Add FAQ** button
- Fill in Question, Answer, Display Order
- Check **Active** checkbox to publish
- Click **Create FAQ**

#### Edit FAQ
- Click the **Pencil** icon on a FAQ row
- Update any fields
- Click **Save changes**

#### Delete FAQ
- Click the **Trash** icon on a FAQ row
- Confirm deletion in the modal

#### Search FAQs
- Use the search bar to find FAQs by question or answer text
- Results filter in real-time

#### Manage Display Order
- Set the `Display Order` number (10, 20, 30, etc.)
- FAQs are sorted by this number on the public page

#### Activate/Deactivate
- Check/uncheck the **Active** checkbox
- Only active FAQs appear on the public website

## 🌐 Public Page Integration

### Using the FAQ Section

Add the FAQ section to any page:

```tsx
import FAQSection from "@/app/components/home/faq-section";

export default function HomePage() {
  return (
    <>
      {/* Other page content */}
      
      <FAQSection
        eyebrow="Common Questions"
        title="Frequently Asked Questions"
        description="Find answers to common questions about our pottery."
      />
    </>
  );
}
```

### Component Props

```typescript
type FAQSectionProps = {
  eyebrow?: string;        // Default: "Common Questions"
  title?: string;          // Default: "Frequently Asked Questions"
  description?: string;    // Default: "Find answers..."
};
```

### Features

- **Responsive**: Mobile, tablet, and desktop optimized
- **Single Expand**: Only one FAQ opens at a time
- **Smooth Animations**: Framer Motion slide and fade transitions
- **Loading State**: Shows skeleton while fetching
- **Empty State**: Hides section if no active FAQs
- **Sort Order**: Displays FAQs in order specified by `display_order`

## 🔌 API Endpoints

### Admin Endpoints (Authenticated)

**GET /api/admin/faqs**
- Fetch all FAQs (active and inactive)
- Returns: `{ faqs: FAQ[] }`

**POST /api/admin/faqs**
- Create new FAQ
- Body: `{ question, answer, display_order, is_active }`
- Returns: `{ faq: FAQ }`

**PUT /api/admin/faqs/[id]**
- Update FAQ
- Body: `{ question, answer, display_order, is_active }`
- Returns: `{ faq: FAQ }`

**DELETE /api/admin/faqs/[id]**
- Delete FAQ
- Returns: `{ success: true }`

### Public Endpoint (Unauthenticated)

**GET /api/faqs**
- Fetch only active FAQs
- Sorted by `display_order`
- Returns: `{ faqs: FAQ[] }`

## 🎨 Design System Compliance

The FAQ section follows all existing design patterns:

### Colors & Styling
- Uses `#1b1511` (primary dark), `#665b4f` (secondary text)
- `#e4d9d0` borders with `#fcfaf7` backgrounds
- Consistent with existing component styling

### Spacing
- Section padding: `py-20 md:py-28`
- Container max-width: `max-w-2xl`
- Gap between FAQs: `space-y-3`

### Rounded Corners
- Accordion items: `rounded-[32px]` (consistent with buttons/inputs)
- Uses `rounded-full` for interactive elements

### Typography
- Title: `font-display text-4xl` (serif display font)
- Body text: `text-sm` (14px, brand typography)
- Eyebrow: `text-[10px] uppercase tracking-[0.36em]`

### Animations
- Framer Motion for smooth transitions
- Staggered children animations
- Scale and opacity changes on interaction

## 🔒 Security

### Authentication
- All admin endpoints require user authentication
- Public endpoint only returns active FAQs
- Supabase RLS policies enforce data access

### Input Validation
- Question and answer required
- Text trimmed and sanitized
- Display order parsed as integer with fallback

### Error Handling
- Comprehensive try/catch blocks
- Meaningful error messages
- Proper HTTP status codes (401, 400, 500)

## 📝 TypeScript Types

```typescript
// lib/faqs.ts

export type FAQ = {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type FAQFormState = {
  id?: string;
  question: string;
  answer: string;
  display_order: string;
  is_active: boolean;
};
```

## 🧪 Testing Checklist

- [ ] Create a test FAQ in admin panel
- [ ] Verify it appears on public page (if active)
- [ ] Test search functionality in admin
- [ ] Test expand/collapse animation on public page
- [ ] Mobile responsive: test on small screen
- [ ] Tablet responsive: test on medium screen
- [ ] Verify only active FAQs show on public
- [ ] Delete a FAQ and verify removal
- [ ] Edit a FAQ and verify changes
- [ ] Test with no FAQs (empty state)
- [ ] Test loading skeleton state

## 📱 Mobile Responsive

The FAQ component is fully responsive:

- **Mobile** (<768px): Full width with adjusted padding
- **Tablet** (768-1024px): Optimized for touch
- **Desktop** (>1024px): Centered container with max-width

All animations work smoothly on all screen sizes.

## 🎯 Next Steps

1. **Run the SQL migration** in Supabase to create the table
2. **Access the admin panel** at `/admin/faqs`
3. **Create some FAQs** with your content
4. **Add the FAQ section** to your homepage or relevant pages
5. **Customize** the eyebrow, title, and description as needed

## 🐛 Troubleshooting

### FAQs not showing on public page
- Verify `is_active` is checked in admin
- Check that FAQs have a `display_order` value
- Ensure you're fetching from `/api/faqs` (not admin endpoint)

### Admin page not loading
- Verify you're authenticated as admin
- Check browser console for errors
- Verify `/api/admin/faqs` endpoint is accessible

### Animations not working
- Ensure Framer Motion is installed (`npm ls framer-motion`)
- Check that `motion` components are imported correctly
- Verify CSS animations aren't being disabled globally

### Database issues
- Check Supabase dashboard for table creation
- Verify RLS policies are enabled
- Ensure service role key is configured

## 📞 Support

For issues or questions:
1. Check the browser console for error messages
2. Review the Supabase dashboard logs
3. Verify all files are in correct locations
4. Ensure TypeScript types are imported correctly

---

**Created with attention to design consistency and user experience! 🎨**
