# Quick Start Guide - Classes Cart Integration

## 🚀 TL;DR

Classes now work like products in a unified cart. Users can add both to the same cart and checkout together.

---

## 📋 What Changed (For Different Roles)

### For Users
1. Class cards now have **"Add to Cart"** button instead of WhatsApp
2. Classes go into the **same cart** as products
3. **One checkout** for both products and classes
4. **One payment** covers everything

### For Admins
1. New page: **Admin → Manage Bookings**
2. See all class bookings in a table
3. Search, filter, export, update statuses
4. View payment proof images
5. Manage booking lifecycle

### For Developers
1. `useCart()` now has `addClass()` method
2. Cart items have `type: "product" | "class"`
3. `/api/orders` handles mixed items
4. New `/api/class-bookings/*` endpoints
5. Products workflow unchanged

---

## 🗂️ File Structure

```
New Components:
├── components/cart/add-class-to-cart.tsx
├── app/admin/class-bookings/bookings-manager.tsx
├── app/admin/class-bookings/page.tsx

New APIs:
├── app/api/class-bookings/route.ts
└── app/api/class-bookings/[id]/route.ts

Updated Components:
├── components/cart/cart-provider.tsx (MAIN CHANGE)
├── app/cart/cart-content.tsx
├── app/checkout/checkout-content.tsx
├── app/components/cards/class-card.tsx
└── ... (10 files total)
```

---

## 🔧 How to Use (Code)

### Add Class to Cart (Client-Side)
```typescript
import { useCart } from '@/components/cart/cart-provider';

// In your component:
const { addClass } = useCart();

// Add a class:
addClass(classData, 2);  // classData, seats
```

### Add Product to Cart (Client-Side)
```typescript
const { addProduct } = useCart();

// Add a product:
addProduct(product, 1, { size: "M", color: "red" });
```

### Checkout with Mixed Items
```typescript
// Cart automatically contains both types
// Checkout handles them differently:
// - Products: shows size/color/quantity
// - Classes: shows date/time/seats

// Submit to /api/orders with items array
// API separates by type and creates appropriate records
```

### Admin Manage Bookings
```typescript
// Go to /admin/class-bookings
// - See all bookings
// - Search: by booking ID, customer, email, class
// - Filter: by status, date
// - Export: to Excel
// - Update: payment status, booking status
```

---

## 📊 Cart Item Types

```typescript
// Product in cart
{
  id: "prod-1::M::red",
  type: "product",
  productId: "prod-1",
  name: "Bowl",
  price: 50,
  quantity: 2,
  size: "M",
  color: "red",
  image: "...",
  slug: "bowl"
}

// Class in cart
{
  id: "class-1",
  type: "class",
  classId: "class-1",
  name: "Pottery 101",
  price: 75,
  seats: 2,
  date: "2025-06-15",
  time: "10:00 AM",
  instructor: "John",
  image: "...",
  slug: "pottery-101"
}
```

---

## 🗄️ Database

### Create Table
```sql
CREATE TABLE class_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id VARCHAR(20) UNIQUE NOT NULL,
  class_id UUID NOT NULL REFERENCES classes(id),
  user_id UUID REFERENCES auth.users(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  number_of_seats INTEGER NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_screenshot TEXT,
  payment_status VARCHAR(50) DEFAULT 'Pending Verification',
  booking_status VARCHAR(50) DEFAULT 'Payment Review',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔌 API Reference

### POST /api/orders
Creates order for products + bookings for classes
```json
{
  "customer_name": "John",
  "customer_email": "john@example.com",
  "customer_phone": "555-1234",
  "address": "123 Main St",
  "items": "[{type:'product',...}, {type:'class',...}]",
  "total_amount": 200,
  "payment_screenshot": File
}
```

### GET /api/class-bookings
Fetch all bookings
```json
{
  "bookings": [{...}, {...}]
}
```

### PUT /api/class-bookings/[id]
Update booking status
```json
{
  "payment_status": "Verified",
  "booking_status": "Confirmed"
}
```

---

## ✅ Quick Verification

### Did it work?
1. Go to `/classes`
2. Click "Add to Cart" on any class
3. Go to `/cart`
4. Should see class in "Classes" section
5. Try adding a product—should appear in "Products" section
6. Go to `/checkout` with both—should show both sections

### Admin Side
1. Go to `/admin/class-bookings`
2. Create a booking through checkout
3. It should appear in the table
4. Click row to see details
5. Try updating status

---

## 🆘 Common Issues

| Problem | Solution |
|---------|----------|
| Class doesn't add to cart | Check browser console for errors |
| Checkout shows only products | Make sure class items have `type: "class"` |
| Admin page won't load | Verify `class_bookings` table exists |
| Payment fails | Check Supabase storage permissions |
| No bookings in admin | Create a booking through checkout first |

---

## 📚 Full Docs

- **CLASSES_CART_INTEGRATION_SUMMARY.md** - Complete overview
- **API_CHANGES.md** - Detailed API docs
- **IMPLEMENTATION_CHECKLIST.md** - Testing checklist
- **INTEGRATION_COMPLETE.md** - Full deployment guide

---

## 🎯 Key Points

✅ **Unified Cart**: One cart for products and classes  
✅ **Type Safe**: TypeScript discriminates items  
✅ **Single Checkout**: Same payment for all items  
✅ **Admin Control**: Full CRUD for bookings  
✅ **Backward Compatible**: Products work as before  
✅ **One Payment**: All items in one transaction  

---

## 🚀 Next Steps

1. Create `class_bookings` table
2. Run tests from IMPLEMENTATION_CHECKLIST.md
3. Deploy to production
4. Monitor logs

Done! 🎉
