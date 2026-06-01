"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { ImageUploader } from "@/components/ui/image-uploader";
import { useCart } from "@/components/cart/cart-provider";
import { formatPrice } from "@/lib/whatsapp";

const inputClassName =
  "mt-2 w-full rounded-[24px] border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20";

export default function CheckoutContent({ paymentQrUrl }: { paymentQrUrl: string }) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [proof, setProof] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    address: "",
  });

  const submit = async () => {
    if (!items.length) {
      toast.error("Your cart is empty.");
      return;
    }
    if (!paymentQrUrl) {
      toast.error("Payment QR is not configured yet.");
      return;
    }
    if (!form.customer_name || !form.customer_email || !form.customer_phone || !form.address || !proof) {
      toast.error("Fill customer details and upload payment proof.");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Creating order...");
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      formData.append("total_amount", String(subtotal));
      formData.append("items", JSON.stringify(items));
      formData.append("payment_screenshot", proof);

      const response = await fetch("/api/orders", { method: "POST", body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error ?? "Unable to create order.");
      clearCart();
      toast.success(`Order ${result.orderId} created.`, { id: toastId });
      router.replace(`/checkout?order=${result.orderId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create order.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fbf8f4] pb-16 pt-28 text-[#171717]">
      <div className="site-container">
        <div className="mb-8 border-b border-black/10 pb-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9a6b4e]">Checkout</p>
          <h1 className="mt-2 text-4xl font-display uppercase leading-none">Payment review</h1>
        </div>

        {items.length ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
            <section className="rounded-[32px] bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em]">Customer details</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  ["customer_name", "Customer name"],
                  ["customer_email", "Email"],
                  ["customer_phone", "Phone"],
                ].map(([key, label]) => (
                  <label key={key} className="block">
                    <span className="text-sm font-medium text-[#352a21]">{label}</span>
                    <input
                      value={form[key as keyof typeof form]}
                      onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                      className={inputClassName}
                    />
                  </label>
                ))}
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-[#352a21]">Address</span>
                  <textarea
                    value={form.address}
                    onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
                    rows={4}
                    className={inputClassName}
                  />
                </label>
              </div>

              <div className="mt-8">
                <ImageUploader
                  label="Payment screenshot"
                  hint="Upload the screenshot after scanning and paying."
                  file={proof}
                  onChange={setProof}
                  onRemove={() => setProof(null)}
                  required
                />
              </div>
            </section>

            <aside className="h-fit rounded-[32px] bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em]">Cart summary</h2>
              <div className="mt-5 grid gap-3">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 border-b border-[#eadfd4] pb-3">
                    <div className="relative h-16 w-16 overflow-hidden rounded-[18px] bg-[#eee6dc]">
                      <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-semibold">{item.name}</p>
                      <p className="mt-1 text-xs text-[#665b4f]">{item.size} / {item.color} x {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex justify-between text-base font-semibold">
                <span>Total payable</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="mt-6 rounded-[28px] bg-[#fbf8f4] p-4 text-center">
                {paymentQrUrl ? (
                  <>
                    <div className="relative mx-auto aspect-square max-w-[240px] overflow-hidden rounded-[20px] bg-white">
                      <Image src={paymentQrUrl} alt="Payment QR code" fill sizes="240px" className="object-contain" />
                    </div>
                    <p className="mt-4 text-sm font-semibold">Scan this QR and pay {formatPrice(subtotal)}</p>
                  </>
                ) : (
                  <p className="py-12 text-sm text-[#665b4f]">Payment QR is not configured yet.</p>
                )}
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={submit}
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1b1511] px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#3a2f27] disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Place order
              </button>
            </aside>
          </div>
        ) : (
          <div className="rounded-[32px] border border-dashed border-black/15 bg-white px-6 py-16 text-center shadow-sm">
            <h2 className="text-3xl font-display uppercase">Nothing to checkout</h2>
            <Link href="/products" className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#1b1511] px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              Browse products
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
