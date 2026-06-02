import Footer from "@/app/components/home/footer";
import Navbar from "@/app/components/home/navbar";
import { getAdminClient } from "@/lib/supabase/admin";
import CheckoutContent from "./checkout-content";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  // Fetch payment QR directly using admin client (bypasses RLS)
  let qrUrl = "";
  try {
    const supabase = getAdminClient();
    const { data } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "payment_qr")
      .maybeSingle();
    
    qrUrl = (data?.value as { url?: string } | null)?.url ?? "";
  } catch (error) {
    console.error("Error fetching payment QR:", error);
  }

  return (
    <>
      <Navbar transparentTone="dark" />
      <CheckoutContent paymentQrUrl={qrUrl} />
      <Footer />
    </>
  );
}
