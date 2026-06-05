import { redirect } from "next/navigation";

import { AdminLayout } from "@/app/admin/admin-layout";
import { createClient } from "@/lib/supabase/server";
import ClassBookingsManager, { type ClassBookingRow } from "./bookings-manager";

export const dynamic = "force-dynamic";

async function getClassBookings(): Promise<ClassBookingRow[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/class-bookings`,
      { cache: "no-store" },
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.bookings || [];
  } catch (error) {
    console.error("Error fetching class bookings:", error);
    return [];
  }
}

export default async function AdminClassBookingsPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/admin/login");

  const bookings = await getClassBookings();

  return (
    <AdminLayout userEmail={userData.user.email ?? ""}>
      <ClassBookingsManager initialBookings={bookings} />
    </AdminLayout>
  );
}
