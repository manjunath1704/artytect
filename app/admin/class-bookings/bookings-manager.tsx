"use client";

import Image from "next/image";
import * as XLSX from "xlsx";
import { useMemo, useState } from "react";
import { Download, Eye, Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";

import { AppSelect, type SelectOption } from "@/components/ui/app-select";
import { Pagination } from "@/components/ui/pagination";
import { formatPrice } from "@/lib/whatsapp";

type BookedClass = {
  id: string;
  class_id: string;
  class_name?: string;
  class_date?: string;
  class_time?: string;
};

export type ClassBookingRow = {
  id: string;
  booking_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  booked_class: BookedClass;
  number_of_seats: number;
  total_amount: number | string;
  payment_screenshot: string;
  payment_status: "Pending Verification" | "Verified" | "Rejected";
  booking_status: "Payment Review" | "Confirmed" | "Completed" | "Cancelled";
  created_at: string;
};

const paymentOptions: SelectOption[] = [
  { value: "all", label: "All payments" },
  { value: "Pending Verification", label: "Pending Verification" },
  { value: "Verified", label: "Verified" },
  { value: "Rejected", label: "Rejected" },
];

const bookingOptions: SelectOption[] = [
  { value: "all", label: "All bookings" },
  { value: "Payment Review", label: "Payment Review" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
];

export default function ClassBookingsManager({ initialBookings }: { initialBookings: ClassBookingRow[] }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [query, setQuery] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [bookingStatus, setBookingStatus] = useState("all");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ClassBookingRow | null>(null);
  const [updating, setUpdating] = useState(false);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return bookings.filter((booking) => {
      const className = booking.booked_class?.class_name || "";
      const matchesQuery =
        !normalized ||
        [booking.booking_id, booking.customer_name, booking.customer_email, className].join(" ").toLowerCase().includes(normalized);
      const matchesPayment = paymentStatus === "all" || booking.payment_status === paymentStatus;
      const matchesBooking = bookingStatus === "all" || booking.booking_status === bookingStatus;
      const matchesDate = !date || booking.created_at.startsWith(date);
      return matchesQuery && matchesPayment && matchesBooking && matchesDate;
    });
  }, [date, bookingStatus, bookings, paymentStatus, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  const exportToExcel = () => {
    const data = filtered.map((booking) => ({
      "Booking ID": booking.booking_id,
      "Customer Name": booking.customer_name,
      "Customer Email": booking.customer_email,
      "Customer Phone": booking.customer_phone,
      "Class": booking.booked_class?.class_name || "N/A",
      "Date": booking.booked_class?.class_date || "N/A",
      "Time": booking.booked_class?.class_time || "N/A",
      "Seats": booking.number_of_seats,
      "Total Amount": formatPrice(Number(booking.total_amount)),
      "Payment Status": booking.payment_status,
      "Booking Status": booking.booking_status,
      "Booked On": new Date(booking.created_at).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Class Bookings");
    XLSX.writeFile(workbook, `class-bookings-${Date.now()}.xlsx`);
    toast.success("Export downloaded");
  };

  const updateBooking = async (bookingId: string, paymentStatus?: string, bookingStatus?: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/class-bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_status: paymentStatus,
          booking_status: bookingStatus,
        }),
      });

      if (!response.ok) throw new Error("Failed to update booking");
      const { booking: updated } = await response.json();

      setBookings((current) =>
        current.map((b) => (b.id === bookingId ? updated : b)),
      );
      setSelected(updated);
      toast.success("Booking updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update booking");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[32px] bg-white p-6 shadow-sm">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8a7765]">Class booking management</p>
            <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b1511]">Class Bookings</h1>
          </div>
          <button onClick={exportToExcel} className="inline-flex h-12 items-center gap-2 rounded-full bg-[#1b1511] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
            <Download className="h-4 w-4" /> Export .xlsx
          </button>
        </div>

        <div className="mt-6 rounded-[32px] bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px_170px]">
            <label className="relative block">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7765]" />
              <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search bookings" className="h-12 w-full rounded-full border border-[#d9ccbc] pl-11 pr-4 text-sm outline-none" />
            </label>
            <AppSelect value={paymentOptions.find((option) => option.value === paymentStatus)} options={paymentOptions} onChange={(option) => { setPaymentStatus(option?.value ?? "all"); setPage(1); }} instanceId="bookings-payment-status" />
            <AppSelect value={bookingOptions.find((option) => option.value === bookingStatus)} options={bookingOptions} onChange={(option) => { setBookingStatus(option?.value ?? "all"); setPage(1); }} instanceId="bookings-booking-status" />
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="h-12 rounded-full border border-[#d9ccbc] px-4 text-sm outline-none" />
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="text-[10px] uppercase tracking-[0.2em] text-[#8a7765]">
                <tr>{["Booking ID", "Customer", "Class", "Seats", "Amount", "Payment Status", "Booking Status", "Date", "Actions"].map((head) => <th key={head} className="border-b border-[#eadfd4] px-3 py-3">{head}</th>)}</tr>
              </thead>
              <tbody>
                {visible.map((booking) => (
                  <tr key={booking.id}>
                    <td className="border-b border-[#f1e7dc] px-3 py-3 font-semibold">{booking.booking_id}</td>
                    <td className="border-b border-[#f1e7dc] px-3 py-3">{booking.customer_name}<br /><span className="text-xs text-[#8a7765]">{booking.customer_email}</span></td>
                    <td className="border-b border-[#f1e7dc] px-3 py-3">{booking.booked_class?.class_name || "N/A"}</td>
                    <td className="border-b border-[#f1e7dc] px-3 py-3">{booking.number_of_seats}</td>
                    <td className="border-b border-[#f1e7dc] px-3 py-3">{formatPrice(Number(booking.total_amount))}</td>
                    <td className="border-b border-[#f1e7dc] px-3 py-3">{booking.payment_status}</td>
                    <td className="border-b border-[#f1e7dc] px-3 py-3">{booking.booking_status}</td>
                    <td className="border-b border-[#f1e7dc] px-3 py-3">{new Date(booking.created_at).toLocaleDateString()}</td>
                    <td className="border-b border-[#f1e7dc] px-3 py-3"><button onClick={() => setSelected(booking)} className="grid h-9 w-9 place-items-center rounded-full border border-[#d9ccbc]"><Eye className="h-4 w-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} /></div>
        </div>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
          <div className="mx-auto my-8 max-w-4xl rounded-[32px] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">{selected.booking_id}</h2>
              <button onClick={() => setSelected(null)} className="grid h-10 w-10 place-items-center rounded-full border border-[#d9ccbc]"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
              <div>
                <div className="rounded-[28px] bg-[#fbf8f4] p-5 text-sm leading-7">
                  <p className="font-semibold">{selected.customer_name}</p>
                  <p>{selected.customer_email}</p>
                  <p>{selected.customer_phone}</p>
                </div>
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7765] mb-3">Class Information</p>
                  <div className="flex gap-3 rounded-[24px] border border-[#eadfd4] p-3">
                    <div className="flex-1 text-sm">
                      <p className="font-semibold">{selected.booked_class?.class_name || "N/A"}</p>
                      <p className="text-[#665b4f]">{selected.booked_class?.class_date} at {selected.booked_class?.class_time}</p>
                      <p className="text-[#665b4f]">Seats: {selected.number_of_seats}</p>
                    </div>
                    <p className="font-semibold">{formatPrice(Number(selected.total_amount))}</p>
                  </div>
                </div>
              </div>
              <aside>
                <a href={selected.payment_screenshot} target="_blank" rel="noreferrer" className="relative block aspect-square overflow-hidden rounded-[28px] bg-[#fbf8f4]">
                  <Image src={selected.payment_screenshot} alt="Payment proof" fill sizes="320px" className="object-contain" />
                </a>
                <div className="mt-4 grid gap-3">
                  <button disabled={updating} onClick={() => updateBooking(selected.id, "Verified", "Confirmed")} className="h-11 rounded-full bg-[#1b1511] text-xs font-semibold uppercase tracking-[0.16em] text-white">Verify payment</button>
                  <button disabled={updating} onClick={() => updateBooking(selected.id, "Rejected", "Cancelled")} className="h-11 rounded-full border border-red-200 text-xs font-semibold uppercase tracking-[0.16em] text-red-600">Reject payment</button>
                  <select disabled={updating} value={selected.booking_status ?? "Payment Review"} onChange={(event) => updateBooking(selected.id, selected.payment_status, event.target.value as ClassBookingRow["booking_status"])} className="h-11 rounded-full border border-[#d9ccbc] px-4 text-sm">
                    {bookingOptions.filter((option) => option.value !== "all").map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                  {updating ? <p className="inline-flex items-center gap-2 text-sm text-[#665b4f]"><Loader2 className="h-4 w-4 animate-spin" /> Updating</p> : null}
                </div>
              </aside>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
