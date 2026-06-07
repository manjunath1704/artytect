import { redirect } from "next/navigation";

import AdminPanel from "./admin-panel";
import { AdminLayout } from "./admin-layout";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/admin/login");
  }

  const { count: messagesCount } = await supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true });

  const { data: ordersData } = await supabase
    .from("orders")
    .select("total_amount, status, payment_status, created_at");

  const { data: bookingsData } = await supabase
    .from("class_bookings")
    .select("total_amount, payment_status, booking_status, created_at");

  const { data: settingsData } = await supabase
    .from("admin_settings")
    .select("value")
    .eq("key", "payment_qr")
    .maybeSingle();

  const orders = ordersData || [];
  const bookings = bookingsData || [];

  const pendingOrdersCount = orders.filter(
    (o) => o.payment_status === "Pending Verification"
  ).length;
  const pendingBookingsCount = bookings.filter(
    (b) => b.payment_status === "Pending Verification"
  ).length;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const monthlyOrdersRevenue =
    (orders
      .filter((o) => {
        if (o.payment_status !== "Verified") return false;
        if (!o.created_at) return false;
        const d = new Date(o.created_at);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      })
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0)) / 100;

  const monthlyBookingsRevenue =
    (bookings
      .filter((b) => {
        if (b.payment_status !== "Verified") return false;
        if (!b.created_at) return false;
        const d = new Date(b.created_at);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      })
      .reduce((sum, b) => sum + Number(b.total_amount || 0), 0)) / 100;

  const totalOrdersRevenue =
    (orders
      .filter((o) => o.payment_status === "Verified")
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0)) / 100;

  const totalBookingsRevenue =
    (bookings
      .filter((b) => b.payment_status === "Verified")
      .reduce((sum, b) => sum + Number(b.total_amount || 0), 0)) / 100;

  const isQrConfigured = !!(settingsData?.value as { url?: string } | null)?.url;

  return (
    <AdminLayout userEmail={data.user.email ?? ""}>
      <AdminPanel
        initialUserEmail={data.user.email ?? ""}
        messagesCount={messagesCount || 0}
        ordersCount={orders.length}
        pendingOrdersCount={pendingOrdersCount}
        monthlyOrdersRevenue={monthlyOrdersRevenue}
        totalOrdersRevenue={totalOrdersRevenue}
        bookingsCount={bookings.length}
        pendingBookingsCount={pendingBookingsCount}
        monthlyBookingsRevenue={monthlyBookingsRevenue}
        totalBookingsRevenue={totalBookingsRevenue}
        isQrConfigured={isQrConfigured}
      />
    </AdminLayout>
  );
}
