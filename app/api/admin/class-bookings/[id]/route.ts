import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { payment_status, booking_status } = body;

    const { data, error } = await supabase
      .from("bookings")
      .update({
        payment_status: payment_status || undefined,
        booking_status: booking_status || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ booking: data });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}
