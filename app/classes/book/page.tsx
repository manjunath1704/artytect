import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function BookingPage() {
  redirect("/classes/checkout");
}

