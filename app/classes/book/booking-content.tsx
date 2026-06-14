"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { ImageUploader } from "@/components/ui/image-uploader";
import { formatPrice } from "@/lib/whatsapp";
import type { PotteryClass } from "@/lib/classes";

const inputClassName =
  "mt-2 w-full rounded-[24px] border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20";

export default function BookingContent({ paymentQrUrl }: { paymentQrUrl: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classId = searchParams.get("classId");

  const [classData, setClassData] = useState<PotteryClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [proof, setProof] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [numberOfSeats, setNumberOfSeats] = useState(1);
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
  });

  useEffect(() => {
    const fetchClass = async () => {
      if (!classId) {
        toast.error("No class selected");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/admin/classes/${classId}`);
        if (response.ok) {
          const data = await response.json();
          setClassData(data.class);
        } else {
          toast.error("Class not found");
        }
      } catch (error) {
        console.error("Error fetching class:", error);
        toast.error("Failed to load class details");
      } finally {
        setLoading(false);
      }
    };

    void fetchClass();
  }, [classId]);

  const totalAmount = classData ? classData.price * numberOfSeats : 0;

  const submit = async () => {
    if (!classData) {
      toast.error("Class data not loaded");
      return;
    }
    if (!paymentQrUrl) {
      toast.error("Payment QR is not configured yet.");
      return;
    }
    if (!form.customer_name || !form.customer_email || !form.customer_phone || !proof) {
      toast.error("Fill customer details and upload payment proof.");
      return;
    }
    if (numberOfSeats < 1) {
      toast.error("Please select at least 1 seat");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Creating booking...");
    try {
      const formData = new FormData();
      formData.append("class_id", classData.id);
      formData.append("customer_name", form.customer_name);
      formData.append("customer_email", form.customer_email);
      formData.append("customer_phone", form.customer_phone);
      formData.append("number_of_seats", String(numberOfSeats));
      formData.append("total_amount", String(totalAmount));
      formData.append("payment_screenshot", proof);

      const response = await fetch("/api/class-bookings", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error ?? "Unable to create booking.");

      toast.success(`Booking ${result.bookingId} created.`, { id: toastId });
      router.replace(`/classes/book?booking=${result.bookingId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create booking.", {
        id: toastId,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fbf8f4] pb-16 pt-28 text-[#171717]">
        <div className="site-container flex items-center justify-center">
          <div className="flex items-center gap-3 text-[#665b4f]">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading class details...</span>
          </div>
        </div>
      </main>
    );
  }

  const bookingUrl = new URL(window.location.href);
  const successBookingId = bookingUrl.searchParams.get("booking");

  if (successBookingId) {
    return (
      <main className="min-h-screen bg-[#fbf8f4] pb-16 pt-28 text-[#171717]">
        <div className="site-container">
          <div className="rounded-[32px] bg-white p-8 text-center">
            <h1 className="text-4xl font-semibold tracking-[-0.03em] text-[#1b1511]">
              Booking Confirmed!
            </h1>
            <p className="mt-4 text-lg text-[#665b4f]">
              Your booking has been created successfully.
            </p>
            <p className="mt-2 font-semibold text-[#1b1511]">Booking ID: {successBookingId}</p>
            <p className="mt-4 text-sm text-[#8a7765]">
              We&apos;ll verify your payment and confirm your booking soon. Check your email for updates.
            </p>
            <button
              onClick={() => router.push("/classes")}
              className="mt-6 inline-flex h-12 items-center rounded-full bg-[#1b1511] px-8 text-white hover:bg-[#3a2f27]"
            >
              Back to Classes
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbf8f4] pb-16 pt-28 text-[#171717]">
      <div className="site-container">
        <div className="mb-8 border-b border-black/10 pb-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9a6b4e]">
            Book Class
          </p>
          <h1 className="mt-2 text-4xl font-display uppercase leading-none">Payment review</h1>
        </div>

        {classData ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
            <section className="rounded-[32px] bg-white p-6 shadow-sm">
              <div className="rounded-[28px] bg-[#fbf8f4] p-5 text-sm leading-7">
                <h2 className="text-lg font-semibold text-[#1b1511]">{classData.title}</h2>
                <p className="mt-2 text-[#665b4f]">{classData.short_description}</p>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-[#8a7765]">Instructor:</span>
                    <p>{classData.instructor_name}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-[#8a7765]">Level:</span>
                    <p>{classData.level}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-[#8a7765]">Date:</span>
                    <p>{classData.class_date}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-[#8a7765]">Time:</span>
                    <p>{classData.class_time}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-[#8a7765]">Duration:</span>
                    <p>{classData.duration}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-[#8a7765]">Available:</span>
                    <p>
                      {classData.available_seats}/{classData.total_seats}
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="mt-8 text-sm font-semibold uppercase tracking-[0.2em]">
                Customer details
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  ["customer_name", "Your name"],
                  ["customer_email", "Email"],
                  ["customer_phone", "Phone"],
                ].map(([key, label]) => (
                  <label key={key} className="block">
                    <span className="text-sm font-medium text-[#352a21]">{label}</span>
                    <input
                      value={form[key as keyof typeof form]}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          [key]: event.target.value,
                        }))
                      }
                      className={inputClassName}
                    />
                  </label>
                ))}
                <label className="block">
                  <span className="text-sm font-medium text-[#352a21]">Number of seats</span>
                  <input
                    type="number"
                    min="1"
                    max={classData.available_seats}
                    value={numberOfSeats}
                    onChange={(event) => setNumberOfSeats(Math.max(1, parseInt(event.target.value) || 1))}
                    className={inputClassName}
                  />
                </label>
              </div>

              <h2 className="mt-8 text-sm font-semibold uppercase tracking-[0.2em]">
                Payment proof
              </h2>
              <div className="mt-4">
                <ImageUploader
                  label="Upload payment screenshot"
                  hint="Upload screenshot of your UPI transfer"
                  file={proof}
                  onChange={(file) => {
                    const f = Array.isArray(file) ? file[0] : file;
                    if (f) setProof(f);
                  }}
                  onRemove={() => setProof(null)}
                />
              </div>
            </section>

            <aside>
              {paymentQrUrl && (
                <div className="rounded-[32px] bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em]">Payment QR</h3>
                  <div className="mt-4 aspect-square overflow-hidden rounded-[28px] bg-[#fbf8f4]">
                    <Image
                      src={paymentQrUrl}
                      alt="Payment QR Code"
                      width={300}
                      height={300}
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>
              )}

              <div className="mt-6 rounded-[32px] bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em]">Booking summary</h3>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Price per seat:</span>
                    <span className="font-semibold">{formatPrice(classData.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Number of seats:</span>
                    <span className="font-semibold">{numberOfSeats}</span>
                  </div>
                  <div className="border-t border-[#eadfd4] pt-3">
                    <div className="flex justify-between font-semibold">
                      <span>Total amount:</span>
                      <span>{formatPrice(totalAmount)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={submit}
                  disabled={submitting}
                  className="mt-6 w-full rounded-full bg-[#1b1511] py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Booking...
                    </span>
                  ) : (
                    "Complete booking"
                  )}
                </button>
              </div>
            </aside>
          </div>
        ) : (
          <div className="rounded-[32px] bg-white p-8 text-center">
            <p className="text-lg text-[#665b4f]">No class selected or class not found.</p>
            <button
              onClick={() => router.push("/classes")}
              className="mt-6 inline-flex h-12 items-center rounded-full bg-[#1b1511] px-8 text-white hover:bg-[#3a2f27]"
            >
              Back to Classes
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
