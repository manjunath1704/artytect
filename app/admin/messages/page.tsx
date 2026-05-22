import { redirect } from "next/navigation";

import { AdminLayout } from "../admin-layout";
import MessagesManager, { type ContactMessageRow } from "./messages-manager";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/admin/login");
  }

  const { data: messagesData, error } = await supabase
    .from("contact_messages")
    .select("id, name, email, phone, subject, message, created_at")
    .order("created_at", { ascending: false });

  const messages: ContactMessageRow[] = error
    ? []
    : (messagesData || []).map((message) => ({
        id: String(message.id),
        name: message.name || "",
        email: message.email || "",
        phone: message.phone || "",
        subject: message.subject || "",
        message: message.message || "",
        created_at: message.created_at || "",
      }));

  return (
    <AdminLayout userEmail={data.user.email ?? ""}>
      <MessagesManager
        initialUserEmail={data.user.email ?? ""}
        initialMessages={messages}
      />
    </AdminLayout>
  );
}
