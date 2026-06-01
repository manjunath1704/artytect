"use client";

import Image from "next/image";
import * as XLSX from "xlsx";
import { useMemo, useState } from "react";
import { Download, Eye, Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";

import { AppSelect, type SelectOption } from "@/components/ui/app-select";
import { Pagination } from "@/components/ui/pagination";
import { formatPrice } from "@/lib/whatsapp";

type OrderedProduct = {
  productId: string;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
};

export type OrderRow = {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  ordered_products: OrderedProduct[];
  total_amount: number | string;
  payment_screenshot: string;
  payment_status: "Pending Verification" | "Verified" | "Rejected";
  order_status: "Payment Review" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  created_at: string;
};

const paymentOptions: SelectOption[] = [
  { value: "all", label: "All payments" },
  { value: "Pending Verification", label: "Pending Verification" },
  { value: "Verified", label: "Verified" },
  { value: "Rejected", label: "Rejected" },
];

const orderOptions: SelectOption[] = [
  { value: "all", label: "All orders" },
  { value: "Payment Review", label: "Payment Review" },
  { value: "Processing", label: "Processing" },
  { value: "Shipped", label: "Shipped" },
  { value: "Delivered", label: "Delivered" },
  { value: "Cancelled", label: "Cancelled" },
];

export default function OrdersManager({ initialOrders }: { initialOrders: OrderRow[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [query, setQuery] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [orderStatus, setOrderStatus] = useState("all");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<OrderRow | null>(null);
  const [updating, setUpdating] = useState(false);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return orders.filter((order) => {
      const products = order.ordered_products.map((product) => product.name).join(" ");
      const matchesQuery =
        !normalized ||
        [order.order_id, order.customer_name, order.customer_email, products].join(" ").toLowerCase().includes(normalized);
      const matchesPayment = paymentStatus === "all" || order.payment_status === paymentStatus;
      const matchesOrder = orderStatus === "all" || order.order_status === orderStatus;
      const matchesDate = !date || order.created_at.startsWith(date);
      return matchesQuery && matchesPayment && matchesOrder && matchesDate;
    });
  }, [date, orderStatus, orders, paymentStatus, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  const updateOrder = async (order: OrderRow, payload: Partial<Pick<OrderRow, "payment_status" | "order_status">>) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error ?? "Unable to update order.");
      setOrders((current) => current.map((item) => (item.id === order.id ? result.order : item)));
      setSelected(result.order);
      toast.success("Order updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update order.");
    } finally {
      setUpdating(false);
    }
  };

  const exportXlsx = () => {
    const rows = filtered.map((order) => ({
      "Order ID": order.order_id,
      Customer: order.customer_name,
      Email: order.customer_email,
      Products: order.ordered_products.map((product) => `${product.name} (${product.size}/${product.color}) x${product.quantity}`).join(", "),
      Total: Number(order.total_amount),
      "Payment Status": order.payment_status,
      "Order Status": order.order_status,
      Date: new Date(order.created_at).toLocaleString(),
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, "orders.xlsx");
  };

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[32px] bg-white p-6 shadow-sm">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8a7765]">Order management</p>
            <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b1511]">Orders</h1>
          </div>
          <button onClick={exportXlsx} className="inline-flex h-12 items-center gap-2 rounded-full bg-[#1b1511] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
            <Download className="h-4 w-4" /> Export .xlsx
          </button>
        </div>

        <div className="mt-6 rounded-[32px] bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px_170px]">
            <label className="relative block">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7765]" />
              <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search orders" className="h-12 w-full rounded-full border border-[#d9ccbc] pl-11 pr-4 text-sm outline-none" />
            </label>
            <AppSelect value={paymentOptions.find((option) => option.value === paymentStatus)} options={paymentOptions} onChange={(option) => setPaymentStatus(option?.value ?? "all")} instanceId="orders-payment-status" />
            <AppSelect value={orderOptions.find((option) => option.value === orderStatus)} options={orderOptions} onChange={(option) => setOrderStatus(option?.value ?? "all")} instanceId="orders-order-status" />
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="h-12 rounded-full border border-[#d9ccbc] px-4 text-sm outline-none" />
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="text-[10px] uppercase tracking-[0.2em] text-[#8a7765]">
                <tr>{["Order ID", "Customer", "Products", "Total Amount", "Payment Status", "Order Status", "Date", "Actions"].map((head) => <th key={head} className="border-b border-[#eadfd4] px-3 py-3">{head}</th>)}</tr>
              </thead>
              <tbody>
                {visible.map((order) => (
                  <tr key={order.id}>
                    <td className="border-b border-[#f1e7dc] px-3 py-3 font-semibold">{order.order_id}</td>
                    <td className="border-b border-[#f1e7dc] px-3 py-3">{order.customer_name}<br /><span className="text-xs text-[#8a7765]">{order.customer_email}</span></td>
                    <td className="border-b border-[#f1e7dc] px-3 py-3">{order.ordered_products.map((product) => product.name).join(", ")}</td>
                    <td className="border-b border-[#f1e7dc] px-3 py-3">{formatPrice(Number(order.total_amount))}</td>
                    <td className="border-b border-[#f1e7dc] px-3 py-3">{order.payment_status}</td>
                    <td className="border-b border-[#f1e7dc] px-3 py-3">{order.order_status}</td>
                    <td className="border-b border-[#f1e7dc] px-3 py-3">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="border-b border-[#f1e7dc] px-3 py-3"><button onClick={() => setSelected(order)} className="grid h-9 w-9 place-items-center rounded-full border border-[#d9ccbc]"><Eye className="h-4 w-4" /></button></td>
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
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">{selected.order_id}</h2>
              <button onClick={() => setSelected(null)} className="grid h-10 w-10 place-items-center rounded-full border border-[#d9ccbc]"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
              <div>
                <div className="rounded-[28px] bg-[#fbf8f4] p-5 text-sm leading-7">
                  <p className="font-semibold">{selected.customer_name}</p>
                  <p>{selected.customer_email}</p>
                  <p>{selected.customer_phone}</p>
                  <p className="mt-2">{selected.address}</p>
                </div>
                <div className="mt-4 grid gap-3">
                  {selected.ordered_products.map((product) => (
                    <div key={`${product.productId}-${product.size}-${product.color}`} className="flex gap-3 rounded-[24px] border border-[#eadfd4] p-3">
                      <div className="relative h-16 w-16 overflow-hidden rounded-[18px] bg-[#eee6dc]">
                        <Image src={product.image} alt={product.name} fill sizes="64px" className="object-cover" />
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-[#665b4f]">Size {product.size} / {product.color} x {product.quantity}</p>
                      </div>
                      <p className="font-semibold">{formatPrice(product.price * product.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <aside>
                <a href={selected.payment_screenshot} target="_blank" rel="noreferrer" className="relative block aspect-square overflow-hidden rounded-[28px] bg-[#fbf8f4]">
                  <Image src={selected.payment_screenshot} alt="Payment proof" fill sizes="320px" className="object-contain" />
                </a>
                <div className="mt-4 grid gap-3">
                  <button disabled={updating} onClick={() => updateOrder(selected, { payment_status: "Verified", order_status: "Processing" })} className="h-11 rounded-full bg-[#1b1511] text-xs font-semibold uppercase tracking-[0.16em] text-white">Verify payment</button>
                  <button disabled={updating} onClick={() => updateOrder(selected, { payment_status: "Rejected" })} className="h-11 rounded-full border border-red-200 text-xs font-semibold uppercase tracking-[0.16em] text-red-600">Reject payment</button>
                  <select disabled={updating} value={selected.order_status} onChange={(event) => updateOrder(selected, { order_status: event.target.value as OrderRow["order_status"] })} className="h-11 rounded-full border border-[#d9ccbc] px-4 text-sm">
                    {orderOptions.filter((option) => option.value !== "all").map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
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
