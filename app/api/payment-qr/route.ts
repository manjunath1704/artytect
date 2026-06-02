import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "payment_qr")
      .maybeSingle();

    if (error) {
      console.error("Error fetching payment QR:", error);
      return NextResponse.json({ url: "" });
    }

    const url = (data?.value as { url?: string } | null)?.url ?? "";
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error in payment-qr API:", error);
    return NextResponse.json({ url: "" });
  }
}
