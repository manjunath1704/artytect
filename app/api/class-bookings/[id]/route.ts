import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

type BookingRouteProps = {
  params: Promise<{ id: string }>;
};

type BookingWithClass = {
  id: string;
  booking_id: string;
  class_id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  number_of_seats: number;
  total_amount: number;
  payment_screenshot: string;
  payment_status: string;
  booking_status: string;
  created_at: string;
  updated_at: string;
  classes: {
    id: string;
    title: string;
    thumbnail_url: string;
    class_date: string;
    class_time: string;
  } | null;
};

export async function GET(request: Request, { params }: BookingRouteProps) {
  try {
    const { id } = await params;
    const supabase = getAdminClient();
    const { data: booking, error } = await supabase
      .from("class_bookings")
      .select("*, classes(id, title, thumbnail_url, class_date, class_time)")
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);

    const typedBooking = booking as unknown as BookingWithClass;
    const cls = typedBooking?.classes;
    const formatted = {
      ...booking,
      booked_class: {
        id: cls?.id || "",
        class_id: typedBooking.class_id,
        class_name: cls?.title || "N/A",
        class_date: cls?.class_date || "N/A",
        class_time: cls?.class_time || "N/A",
        thumbnail_url: cls?.thumbnail_url || "",
      },
      classes: undefined,
    };

    return NextResponse.json({ booking: formatted });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch booking." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: BookingRouteProps) {
  try {
    const { id } = await params;
    const body = await request.json();
    const update: Record<string, string> = { updated_at: new Date().toISOString() };
    if (body.payment_status) update.payment_status = body.payment_status;
    if (body.booking_status) update.booking_status = body.booking_status;

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("class_bookings")
      .update(update)
      .eq("id", id)
      .select("*, classes(id, title, thumbnail_url, class_date, class_time)")
      .single();
    if (error) throw new Error(error.message);

    const typedBooking = data as unknown as BookingWithClass;
    const cls = typedBooking?.classes;
    const formatted = {
      ...data,
      booked_class: {
        id: cls?.id || "",
        class_id: typedBooking.class_id,
        class_name: cls?.title || "N/A",
        class_date: cls?.class_date || "N/A",
        class_time: cls?.class_time || "N/A",
        thumbnail_url: cls?.thumbnail_url || "",
      },
      classes: undefined,
    };

    return NextResponse.json({ booking: formatted });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update booking." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: BookingRouteProps) {
  try {
    const { id } = await params;
    const supabase = getAdminClient();
    const { error } = await supabase.from("class_bookings").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ message: "Booking deleted." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete booking." },
      { status: 500 },
    );
  }
}
