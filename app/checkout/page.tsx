import Footer from "@/app/components/home/footer";
import Navbar from "@/app/components/home/navbar";
import { createClient } from "@/lib/supabase/server";
import CheckoutContent from "./checkout-content";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("admin_settings")
    .select("value")
    .eq("key", "payment_qr")
    .maybeSingle();

  return (
    <>
      <Navbar transparentTone="dark" />
      <CheckoutContent paymentQrUrl={(data?.value as { url?: string } | null)?.url ?? ""} />
      <Footer />
    </>
  );
}
