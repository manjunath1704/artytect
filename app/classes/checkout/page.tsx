import Navbar from "@/app/components/home/navbar";
import Footer from "@/app/components/home/footer";
import BookingCheckoutContent from "./checkout-content";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getPaymentQr(): Promise<string> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "payment_qr")
      .maybeSingle();

    return (data?.value as { url?: string } | null)?.url ?? "";
  } catch (error) {
    console.error("Error fetching payment QR:", error);
    return "";
  }
}

export default async function BookingCheckoutPage() {
  const paymentQrUrl = await getPaymentQr();

  return (
    <>
      <Navbar />
      <BookingCheckoutContent paymentQrUrl={paymentQrUrl} />
      <Footer />
    </>
  );
}
