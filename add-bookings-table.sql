-- Create bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id TEXT NOT NULL UNIQUE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  number_of_seats INTEGER NOT NULL DEFAULT 1,
  total_amount INTEGER NOT NULL,
  payment_screenshot TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'Pending Verification',
  booking_status TEXT NOT NULL DEFAULT 'Booking Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Public read policy (for checking booking status)
CREATE POLICY "public_can_read_own_booking" ON bookings
  FOR SELECT USING (true);

-- Authenticated can create bookings
CREATE POLICY "authenticated_can_create_booking" ON bookings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Authenticated can update own booking
CREATE POLICY "authenticated_can_update_own_booking" ON bookings
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Admin authenticated can do anything
CREATE POLICY "admin_all_bookings" ON bookings
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create an index on class_id for faster queries
CREATE INDEX idx_bookings_class_id ON bookings(class_id);
CREATE INDEX idx_bookings_customer_email ON bookings(customer_email);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_booking_status ON bookings(booking_status);
