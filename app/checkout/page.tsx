import Footer from "@/app/components/home/footer";
import Navbar from "@/app/components/home/navbar";
import CheckoutContent from "./checkout-content";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  // Fetch payment QR via API (bypasses RLS issues)
  let qrUrl = "";
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/payment-qr`, {
      cache: "no-store",
    });
    const result = await response.json();
    qrUrl = result.url || "";
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
