# FAQ Section - Quick Start

## ⚡ 5-Minute Setup

### Step 1: Create Database Table (1 min)

Copy the SQL from `create-faqs-table.sql` and paste it into your Supabase SQL Editor, then execute it.

### Step 2: Admin Panel is Ready (Instant)

The admin panel is already integrated! Navigate to `/admin/faqs` to start managing FAQs.

### Step 3: Add FAQ Section to Public Site (1 min)

```tsx
// In any page component (e.g., app/page.tsx)

import FAQSection from "@/app/components/home/faq-section";

export default function HomePage() {
  return (
    <>
      {/* ... other content ... */}
      
      <FAQSection
        eyebrow="Common Questions"
        title="Frequently Asked Questions"
        description="Find answers to your questions about our pottery and classes."
      />
    </>
  );
}
```

That's it! 🎉

## 📁 What Was Created

```
Files Created:
✅ create-faqs-table.sql                    - Database schema
✅ lib/faqs.ts                              - TypeScript types
✅ app/api/admin/faqs/route.ts              - Admin API (GET/POST)
✅ app/api/admin/faqs/[id]/route.ts         - Admin API (PUT/DELETE)
✅ app/api/faqs/route.ts                    - Public API
✅ app/admin/faqs/faqs-manager.tsx          - Admin UI component
✅ app/admin/faqs/page.tsx                  - Admin page wrapper
✅ app/components/home/faq-section.tsx      - Public component
✅ app/components/home/faq-section-skeleton.tsx - Loading skeleton
✅ FAQs added to admin sidebar              - Navigation

Total: 10 new files + sidebar update
```

## 🎯 Key Features Included

### Admin Dashboard
- ✅ Create FAQs with Question, Answer, Display Order
- ✅ Edit existing FAQs
- ✅ Delete FAQs with confirmation
- ✅ Search & filter FAQs
- ✅ Activate/deactivate FAQs
- ✅ Reorder by display_order number
- ✅ View status (Active/Inactive)
- ✅ Created date tracking

### Public Website
- ✅ Responsive accordion component
- ✅ One FAQ opens at a time
- ✅ Smooth expand/collapse animations
- ✅ Only shows active FAQs
- ✅ Sorted by display order
- ✅ Loading skeleton
- ✅ Empty state handling
- ✅ Mobile/tablet/desktop optimized

## 📝 Usage

### Admin URL
```
/admin/faqs
```

### Create your first FAQ
1. Go to `/admin/faqs`
2. Click "Add FAQ"
3. Enter Question (e.g., "How long do classes take?")
4. Enter Answer (e.g., "Most classes are 2 hours long...")
5. Set Display Order (e.g., 10, 20, 30)
6. Check "Active" to publish
7. Click "Create FAQ"

### Add to Homepage
```tsx
<FAQSection
  eyebrow="Got Questions?"
  title="Frequently Asked Questions"
  description="Find answers to common questions."
/>
```

## 🎨 Design System

- Uses existing brand colors (#1b1511, #665b4f, etc.)
- Rounded corners: `rounded-[32px]` throughout
- Spacing: Consistent with existing components
- Typography: Matches site font sizes and weights
- Animations: Smooth Framer Motion transitions
- Responsive: Mobile, tablet, desktop ready

## 🚀 What's Next?

1. Run the SQL in Supabase ✅
2. Add FAQs in admin panel
3. Add `<FAQSection />` to your site
4. Customize eyebrow, title, description as needed
5. Reorder FAQs as needed

## ✨ That's It!

Your FAQ section is now fully functional! No additional configuration needed.

---

**Questions?** Check `FAQ_IMPLEMENTATION_GUIDE.md` for detailed documentation.
