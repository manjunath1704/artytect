# API Changes for Classes Cart Integration

## Modified APIs

### POST `/api/orders`

**Request Format** (FormData):
```
- customer_name: string
- customer_email: string
- customer_phone: string
- address: string (optional for class-only orders)
- total_amount: number
- items: JSON string (array of mixed items)
- payment_screenshot: File
```

**Items Array Structure** (NEW - Supports Mixed Types):
```typescript
type CartItem = {
  id: string;
  type: "product" | "class";  // NEW: Item type discriminator
  name: string;
  price: number;
  image: string;
  slug: string;
  
  // Product-specific
  productId?: string;
  size?: string;
  color?: string;
  quantity?: number;
  
  // Class-specific
  classId?: string;
  seats?: number;
  date?: string;
  time?: string;
  instructor?: string;
}
```

**Response**:
```json
{
  "orderId": "AT-20250605-ABC12"
}
```

**Behavior Changes**:
1. If cart contains products → creates `orders` record
2. If cart contains classes → creates `class_bookings` records
3. Both use same payment screenshot
4. Single order/booking ID returned
5. Payment status defaults to "Pending Verification"
6. Booking status defaults to "Payment Review"

---

## New APIs

### POST `/api/class-bookings`

**Request Format** (FormData):
```
- class_id: string
- customer_name: string
- customer_email: string
- customer_phone: string
- number_of_seats: number
- total_amount: number
- payment_screenshot: File
```

**Response**:
```json
{
  "bookingId": "CB-20250605-ABC12"
}
```

**Notes**:
- Creates booking with status: "Payment Review"
- Payment status: "Pending Verification"
- Records payment screenshot URL
- Used internally by `/api/orders` for class items

---

### GET `/api/class-bookings`

**Request**: No parameters

**Response**:
```json
{
  "bookings": [
    {
      "id": "uuid",
      "booking_id": "CB-20250605-ABC12",
      "class_id": "class-uuid",
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "customer_phone": "555-1234",
      "number_of_seats": 2,
      "total_amount": 100,
      "payment_screenshot": "https://...",
      "payment_status": "Pending Verification",
      "booking_status": "Payment Review",
      "created_at": "2025-06-05T10:30:00Z",
      "updated_at": "2025-06-05T10:30:00Z"
    }
  ]
}
```

---

### GET `/api/class-bookings/[id]`

**Request**: URL parameter `id` (booking record ID)

**Response**: Single booking object (same structure as GET list)

---

### PUT `/api/class-bookings/[id]`

**Request Body** (JSON):
```json
{
  "payment_status": "Verified",  // Optional
  "booking_status": "Confirmed"  // Optional
}
```

**Response**: Updated booking object

**Valid Values**:
- `payment_status`: "Pending Verification" | "Verified" | "Rejected"
- `booking_status`: "Payment Review" | "Confirmed" | "Completed" | "Cancelled"

**Notes**:
- Updates `updated_at` timestamp automatically
- Only updates provided fields
- Both fields optional (update either or both)

---

### DELETE `/api/class-bookings/[id]`

**Request**: URL parameter `id` (booking record ID)

**Response**:
```json
{
  "message": "Booking deleted."
}
```

**Notes**:
- Hard delete (use carefully)
- No soft delete implemented
- Used in admin for removing invalid/test bookings

---

## Migration Guide

### For Frontend Consuming Orders API

**Before** (Products Only):
```typescript
const items = [
  {
    id: "prod-1::M::red",
    productId: "prod-1",
    name: "Bowl",
    price: 50,
    size: "M",
    color: "red",
    quantity: 2,
    image: "..."
  }
];

const formData = new FormData();
formData.append("items", JSON.stringify(items));
// ... other fields
```

**After** (Products + Classes):
```typescript
const items = [
  {
    id: "prod-1::M::red",
    type: "product",  // NEW
    productId: "prod-1",
    name: "Bowl",
    price: 50,
    size: "M",
    color: "red",
    quantity: 2,
    image: "..."
  },
  {
    id: "class-1",
    type: "class",  // NEW
    classId: "class-1",
    name: "Pottery 101",
    price: 75,
    seats: 2,
    date: "2025-06-15",
    time: "10:00 AM",
    image: "..."
  }
];

const formData = new FormData();
formData.append("items", JSON.stringify(items));
// ... other fields
```

### For Admin Reading Bookings

```typescript
// Fetch all bookings
const response = await fetch('/api/class-bookings');
const { bookings } = await response.json();

// Fetch single booking
const response = await fetch(`/api/class-bookings/${bookingId}`);
const { booking } = await response.json();

// Update booking status
const response = await fetch(`/api/class-bookings/${bookingId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    payment_status: 'Verified',
    booking_status: 'Confirmed'
  })
});
```

---

## Error Handling

All endpoints return errors in this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

**Common Error Codes**:

| Status | Scenario |
|--------|----------|
| 400 | Missing required fields, invalid item types |
| 400 | Cart is empty |
| 400 | Payment amount doesn't match total |
| 500 | File upload failed |
| 500 | Database operation failed |

---

## Database Schema

### Required `class_bookings` Table

```sql
CREATE TABLE class_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id VARCHAR(20) UNIQUE NOT NULL,
  class_id UUID NOT NULL REFERENCES classes(id),
  user_id UUID REFERENCES auth.users(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  number_of_seats INTEGER NOT NULL CHECK (number_of_seats > 0),
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_screenshot TEXT,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending Verification',
  booking_status VARCHAR(50) NOT NULL DEFAULT 'Payment Review',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_class_bookings_booking_id ON class_bookings(booking_id);
CREATE INDEX idx_class_bookings_customer_email ON class_bookings(customer_email);
CREATE INDEX idx_class_bookings_payment_status ON class_bookings(payment_status);
CREATE INDEX idx_class_bookings_booking_status ON class_bookings(booking_status);
```

---

## Testing Checklist

- [ ] POST /api/orders with products only
- [ ] POST /api/orders with classes only
- [ ] POST /api/orders with mixed products and classes
- [ ] GET /api/class-bookings returns all bookings
- [ ] GET /api/class-bookings/[id] returns single booking
- [ ] PUT /api/class-bookings/[id] updates payment status
- [ ] PUT /api/class-bookings/[id] updates booking status
- [ ] DELETE /api/class-bookings/[id] removes booking
- [ ] Admin can view, filter, and export bookings
- [ ] Payment screenshot accessible for all items
- [ ] Order vs booking distinction works correctly
