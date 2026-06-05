# Class Booking & Payment Implementation

## Overview
Complete booking and payment system for pottery classes, following the same pattern as product orders with UPI payment QR code.

## Components Implemented

### 1. Database Setup
**File:** `add-bookings-table.sql`
- Creates `bookings` table with complete schema
- Fields: booking_id, class_id, customer info, seats, amount, payment screenshot, statuses
- RLS policies for authenticated users and admins
- Indexes for performance optimization
- Status fields:
  - `payment_status`: "Pending Verification", "Verified", "Rejected"
  - `booking_status`: "Booking Pending", "Confirmed", "Cancelled"

### 2. API Endpoints

#### Public Booking Creation
**Endpoint:** `POST /api/class-bookings`
- Accepts FormData with:
  - class_id
  - customer_name, email, phone
  - number_of_seats
  - total_amount (in paise)
  - payment_screenshot (file)
- Creates storage bucket `class-booking-proof`
- Uploads payment screenshot
- Generates unique booking ID (BOOK-{timestamp}-{random})
- Returns booking data and booking ID

#### Admin Bookings Management
**Endpoints:**
- `GET /api/admin/class-bookings` - Fetch all bookings with class details
- `PUT /api/admin/class-bookings/[id]` - Update payment_status or booking_status
- `GET /api/admin/classes/[id]/get-route.ts` - Fetch class by ID for booking page

### 3. Admin Interface

#### Bookings Manager (`app/admin/class-bookings/bookings-manager.tsx`)
Features:
- Search by booking ID, customer name/email, class name
- Filter by payment status (Pending Verification, Verified, Rejected)
- Filter by booking status (Booking Pending, Confirmed, Cancelled)
- Filter by date
- Pagination (10 items per page)
- Export to Excel (.xlsx)
- Detail view modal showing:
  - Customer information
  - Class details (title, date, time, instructor)
  - Number of seats and pricing breakdown
  - Total amount
  - Payment screenshot preview
  - Actions:
    - "Verify payment" → sets payment_status="Verified" and booking_status="Confirmed"
    - "Reject payment" → sets payment_status="Rejected"
    - Dropdown to update booking_status

#### Bookings Page (`app/admin/class-bookings/page.tsx`)
- Server-rendered with authentication check
- Fetches all bookings with class relationships
- Wrapped in AdminLayout

### 4. Public Booking Page

#### Booking Page (`app/classes/book/page.tsx`)
- Fetches payment QR from admin_settings
- Passes to BookingContent component

#### Booking Content (`app/classes/book/booking-content.tsx`)
- Class selection via URL parameter: `/classes/book?classId={classId}`
- Displays full class information
- Payment QR code visible
- Customer form (name, email, phone)
- Seat selection (1 to available seats)
- Real-time price calculation
- Payment screenshot upload
- Success confirmation with booking ID
- Booking flow:
  1. User selects class from listing
  2. Navigates to booking page with classId
  3. Fills customer details
  4. Selects number of seats
  5. Takes screenshot of UPI payment
  6. Uploads screenshot
  7. System creates booking
  8. Shows success with booking ID
  9. Admin verifies payment and confirms booking

## Integration with Existing Systems

### Payment QR
- Uses same `admin_settings` table
- Key: `payment_qr`
- Fetched via admin client (bypasses RLS)
- Displayed on booking page

### Storage Buckets
- Created: `class-booking-proof`
- Public bucket for payment screenshots
- Similar to product order payment proofs

### Admin Panel
- Added "Bookings" card to admin dashboard
- Links to `/admin/class-bookings`
- Shows "Manage Bookings" button
- Accessible alongside Classes management

## Database Migrations Required

Execute this SQL in Supabase SQL Editor:
```sql
-- See add-bookings-table.sql for complete migration
```

## User Flow

### For Students
1. Browse classes at `/classes`
2. View class details at `/classes/[slug]`
3. Click "Book Class" button (to be added to class detail page)
4. Redirected to `/classes/book?classId={classId}`
5. Fill booking form
6. Upload payment proof (UPI screenshot)
7. Click "Complete Booking"
8. Receive booking confirmation with ID

### For Admin
1. Navigate to `/admin/class-bookings`
2. View all bookings in table
3. Filter/search as needed
4. Click eye icon to view booking details
5. Review payment screenshot
6. Verify payment or reject
7. Update booking status (Confirmed/Cancelled)
8. Export bookings to Excel

## Files Created

### Database
- `add-bookings-table.sql`

### API Routes
- `app/api/class-bookings/route.ts`
- `app/api/admin/class-bookings/route.ts`
- `app/api/admin/class-bookings/[id]/route.ts`
- `app/api/admin/classes/[id]/get-route.ts`

### Admin Interface
- `app/admin/class-bookings/page.tsx`
- `app/admin/class-bookings/bookings-manager.tsx`

### Public Pages
- `app/classes/book/page.tsx`
- `app/classes/book/booking-content.tsx`

## Integration Checklist

- [x] Database table created
- [x] API endpoints implemented
- [x] Admin bookings manager UI
- [x] Public booking page
- [x] Payment QR integration
- [x] Storage bucket configuration
- [x] Admin panel link
- [x] Build verification
- [ ] Database migration (manual - run add-bookings-table.sql in Supabase)
- [ ] Add "Book Class" button to class detail page (requires modification to existing class page)
- [ ] Test end-to-end booking flow

## Next Steps

1. Run `add-bookings-table.sql` in Supabase SQL Editor
2. Create storage bucket `class-booking-proof` in Supabase if not auto-created
3. Add "Book Now" button to `/app/classes/[slug]/page.tsx` that links to `/classes/book?classId={classId}`
4. Test booking flow end-to-end
5. Optional: Add booking confirmation email notifications
