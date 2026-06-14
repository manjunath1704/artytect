import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { ensurePaymentAssetsBucket, getAdminClient, PAYMENT_BUCKET } from "@/lib/supabase/admin";

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

const getUser = async () => {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    },
  );
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
};

const makeBookingId = () => `CB-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const classId = String(formData.get("class_id") ?? "").trim();
    const customerName = String(formData.get("customer_name") ?? "").trim();
    const customerEmail = String(formData.get("customer_email") ?? "").trim();
    const customerPhone = String(formData.get("customer_phone") ?? "").trim();
    const numberOfSeats = Number(formData.get("number_of_seats") ?? 1);
    const totalAmount = Number(formData.get("total_amount") ?? 0);
    const proof = formData.get("payment_screenshot");

    if (!classId || !customerName || !customerEmail || !customerPhone || numberOfSeats < 1 || !totalAmount) {
      return NextResponse.json({ error: "Class details, customer info, and amount are required." }, { status: 400 });
    }
    if (!(proof instanceof File)) {
      return NextResponse.json({ error: "Please upload payment proof." }, { status: 400 });
    }

    await ensurePaymentAssetsBucket();
    const supabase = getAdminClient();
    const extension = proof.name.includes(".") ? proof.name.split(".").pop() : "jpg";
    const filePath = `proofs/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    const { error: uploadError } = await supabase.storage.from(PAYMENT_BUCKET).upload(
      filePath,
      Buffer.from(await proof.arrayBuffer()),
      { contentType: proof.type || "image/jpeg", upsert: false },
    );
    if (uploadError) throw new Error(uploadError.message);
    const { data: publicUrl } = supabase.storage.from(PAYMENT_BUCKET).getPublicUrl(filePath);
    const user = await getUser();

    const { data: booking, error } = await supabase
      .from("class_bookings")
      .insert({
        booking_id: makeBookingId(),
        class_id: classId,
        user_id: user?.id ?? null,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        number_of_seats: numberOfSeats,
        total_amount: totalAmount,
        payment_screenshot: publicUrl.publicUrl,
        payment_status: "Pending Verification",
        booking_status: "Payment Review",
      })
      .select("booking_id")
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ bookingId: booking.booking_id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create booking." },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const supabase = getAdminClient();
    const { data: bookings, error } = await supabase
      .from("class_bookings")
      .select("*, classes(id, title, thumbnail_url, class_date, class_time)")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    const formattedBookings = ((bookings || []) as unknown as BookingWithClass[]).map((booking) => {
      const cls = booking.classes;
      return {
        ...booking,
        booked_class: {
          id: cls?.id || "",
          class_id: booking.class_id,
          class_name: cls?.title || "N/A",
          class_date: cls?.class_date || "N/A",
          class_time: cls?.class_time || "N/A",
          thumbnail_url: cls?.thumbnail_url || "",
        },
        classes: undefined,
      };
    });

    return NextResponse.json({ bookings: formattedBookings }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch bookings." },
      { status: 500 },
    );
  }
}
