import { redirect } from "next/navigation";
import Link from "next/link";

import Navbar from "@/app/components/home/navbar";
import Footer from "@/app/components/home/footer";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import AccountLogoutButton from "./account-logout-button";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login?next=/account");
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("full_name, email, avatar_url, auth_provider")
    .eq("id", data.user.id)
    .maybeSingle();

  const displayName = profile?.full_name || data.user.user_metadata?.name || "Your account";

  return (
    <>
      <Navbar forceSolid />
      <main className="min-h-[70svh] bg-[#f6efe4] px-6 py-16 sm:px-8 lg:px-10">
        <section className="mx-auto max-w-4xl rounded-[10px] bg-white p-6 shadow-sm sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8a7765]">
            Protected account
          </p>
          <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-4xl uppercase leading-none tracking-normal text-[#1b1511]">
                {displayName}
              </h1>
              <p className="mt-3 text-sm text-[#665b4f]">{profile?.email || data.user.email}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#8a7765]">
                Provider: {profile?.auth_provider || "email"}
              </p>
            </div>
            <AccountLogoutButton />
          </div>

          <div className="mt-8 rounded-[10px] border border-[#e8ddd1] bg-[#fcfaf7] p-5 text-sm leading-7 text-[#665b4f]">
            Your Supabase session is active and protected middleware allowed this route.
          </div>

          <Button
            asChild
            className="mt-6 h-11 rounded-[10px] bg-[#1b1511] px-5 text-[#f8f2e8] hover:bg-[#2a211a]"
          >
            <Link href="/products">Browse products</Link>
          </Button>
        </section>
      </main>
      <Footer />
    </>
  );
}
