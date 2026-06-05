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
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a8d82]" />
          <input
            type="text"
            placeholder="Search booking ID, customer, class..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="h-11 w-full rounded-full border border-[#d9ccbc] bg-white px-4 py-3 pl-11 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67]"
          />
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setPage(1);
          }}
          className="h-11 rounded-full border border-[#d9ccbc] bg-white px-4 text-sm text-[#1b1511] outline-none transition focus:border-[#b38d67]"
        />
        <button
          onClick={exportToExcel}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#d9ccbc] px-6 text-sm font-semibold text-[#1b1511] transition hover:bg-[#f5eee4]"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AppSelect
          label="Payment Status"
          options={paymentOptions}
          value={paymentStatus}
          onChange={(value) => {
            setPaymentStatus(value);
            setPage(1);
          }}
        />
        <AppSelect
          label="Booking Status"
          options={bookingOptions}
          value={bookingStatus}
          onChange={(value) => {
            setBookingStatus(value);
            setPage(1);
          }}
        />
      </div>

      <div className="overflow-x-auto rounded-[32px] border border-[#e2d6ca] bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e2d6ca]">
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#1b1511]">Booking ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#1b1511]">Customer</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#1b1511]">Class</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-[#1b1511]">Seats</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-[#1b1511]">Amount</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#1b1511]">Payment</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#1b1511]">Booking</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-[#1b1511]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((booking) => (
              <tr key={booking.id} className="border-b border-[#e2d6ca] hover:bg-[#faf6f2]">
                <td className="px-6 py-4 text-sm font-semibold text-[#1b1511]">{booking.booking_id}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="font-semibold text-[#1b1511]">{booking.customer_name}</div>
                  <div className="text-xs text-[#8a7765]">{booking.customer_email}</div>
                </td>
                <td className="px-6 py-4 text-sm text-[#6f6259]">
                  {booking.booked_class?.class_name || "N/A"}
                  <div className="text-xs text-[#9a8d82]">{booking.booked_class?.class_date}</div>
                </td>
                <td className="px-6 py-4 text-center text-sm font-semibold text-[#1b1511]">{booking.number_of_seats}</td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-[#1b1511]">{formatPrice(Number(booking.total_amount))}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] ${
                      booking.payment_status === "Verified"
                        ? "bg-green-100 text-green-700"
                        : booking.payment_status === "Rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {booking.payment_status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] ${
                      booking.booking_status === "Completed"
                        ? "bg-blue-100 text-blue-700"
                        : booking.booking_status === "Cancelled"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {booking.booking_status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => setSelected(booking)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d9ccbc] text-[#1b1511] transition hover:bg-[#f5eee4]"
                    title="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visible.length === 0 && (
        <div className="rounded-[32px] border border-dashed border-[#d9ccbc] bg-white px-6 py-12 text-center">
          <p className="text-sm text-[#8a7765]">No bookings found</p>
        </div>
      )}

      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-[32px] bg-white shadow-lg sm:p-8 flex flex-col max-h-[90vh]">
            <div className="mb-6 flex items-center justify-between border-b border-[#e2d6ca] pb-4 px-6 sm:px-8 pt-6 sm:pt-8 shrink-0">
              <h2 className="text-2xl font-display uppercase">Booking Details</h2>
              <button
                onClick={() => setSelected(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#f5eee4]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto px-6 sm:px-8 py-6 flex-1">
              {/* Booking Info */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a6b4e]">Booking Information</p>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-[#8a7765]">Booking ID</p>
                    <p className="mt-1 font-semibold text-[#1b1511]">{selected.booking_id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8a7765]">Date</p>
                    <p className="mt-1 font-semibold text-[#1b1511]">{new Date(selected.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a6b4e]">Customer Information</p>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-[#8a7765]">Name</p>
                    <p className="mt-1 font-semibold text-[#1b1511]">{selected.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8a7765]">Email</p>
                    <p className="mt-1 font-semibold text-[#1b1511]">{selected.customer_email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8a7765]">Phone</p>
                    <p className="mt-1 font-semibold text-[#1b1511]">{selected.customer_phone}</p>
                  </div>
                </div>
              </div>

              {/* Class Info */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a6b4e]">Class Details</p>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-[#8a7765]">Class</p>
                    <p className="mt-1 font-semibold text-[#1b1511]">{selected.booked_class?.class_name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8a7765]">Date & Time</p>
                    <p className="mt-1 font-semibold text-[#1b1511]">
                      {selected.booked_class?.class_date} at {selected.booked_class?.class_time}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8a7765]">Seats Booked</p>
                    <p className="mt-1 font-semibold text-[#1b1511]">{selected.number_of_seats}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8a7765]">Total Amount</p>
                    <p className="mt-1 font-semibold text-[#1b1511]">{formatPrice(Number(selected.total_amount))}</p>
                  </div>
                </div>
              </div>

              {/* Payment Proof */}
              {selected.payment_screenshot && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a6b4e]">Payment Proof</p>
                  <div className="mt-3 relative aspect-video max-w-md overflow-hidden rounded-[24px] bg-[#f5eee4]">
                    <Image
                      src={selected.payment_screenshot}
                      alt="Payment proof"
                      fill
                      sizes="400px"
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Status Updates */}
              <div className="border-t border-[#e2d6ca] pt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a6b4e]">Update Status</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block">
                      <span className="text-xs font-medium text-[#352a21]">Payment Status</span>
                      <select
                        value={selected.payment_status}
                        onChange={(e) => updateBooking(selected.id, e.target.value, selected.booking_status)}
                        disabled={updating}
                        className="mt-2 w-full rounded-[12px] border border-[#d9ccbc] bg-white px-3 py-2 text-sm text-[#1b1511] outline-none transition focus:border-[#b38d67]"
                      >
                        <option value="Pending Verification">Pending Verification</option>
                        <option value="Verified">Verified</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </label>
                  </div>
                  <div>
                    <label className="block">
                      <span className="text-xs font-medium text-[#352a21]">Booking Status</span>
                      <select
                        value={selected.booking_status}
                        onChange={(e) => updateBooking(selected.id, selected.payment_status, e.target.value)}
                        disabled={updating}
                        className="mt-2 w-full rounded-[12px] border border-[#d9ccbc] bg-white px-3 py-2 text-sm text-[#1b1511] outline-none transition focus:border-[#b38d67]"
                      >
                        <option value="Payment Review">Payment Review</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </label>
                  </div>
                </div>
                {updating && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-[#665b4f]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelected(null)}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full border border-[#d9ccbc] px-6 text-sm font-semibold text-[#1b1511] transition hover:bg-[#f5eee4] shrink-0 mx-6 sm:mx-8 mb-6 sm:mb-8"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
