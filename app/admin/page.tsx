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
    .from('contact_messages')
    .select('*', { count: 'exact', head: true });

  const { count: bookingsCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true });

  const { count: ordersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  return (
    <AdminLayout userEmail={data.user.email ?? ""}>
      <AdminPanel
        initialUserEmail={data.user.email ?? ""}
        messagesCount={messagesCount || 0}
        bookingsCount={bookingsCount || 0}
        ordersCount={ordersCount || 0}
      />
    </AdminLayout>
  );
}
