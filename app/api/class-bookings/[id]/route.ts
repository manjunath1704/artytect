import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

type BookingRouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: BookingRouteProps) {
  try {
    const { id } = await params;
    const supabase = getAdminClient();
    const { data: booking, error } = await supabase
      .from("class_bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ booking });
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
      .select()
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ booking: data });
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
