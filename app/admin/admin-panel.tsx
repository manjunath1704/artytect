"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, LogOut, FolderOpen, Package, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type AdminPanelProps = {
  initialUserEmail: string;
  categoriesCount: number;
};

const AdminPanel = ({ initialUserEmail, categoriesCount }: AdminPanelProps) => {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState(initialUserEmail);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const syncSession = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/admin/login");
        return;
      }

      setUserEmail(data.user.email ?? initialUserEmail);
      setCheckingSession(false);
    };

    void syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/admin/login");
        return;
      }

      setUserEmail(session.user.email ?? initialUserEmail);
    });

    return () => subscription.unsubscribe();
  }, [initialUserEmail, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  };

  if (checkingSession) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-[linear-gradient(180deg,#f6efe4_0%,#efe4d5_100%)] px-6">
        <div className="flex items-center gap-3 text-[#665b4f]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Checking admin session...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100svh] bg-[linear-gradient(180deg,#f6efe4_0%,#efe4d5_100%)] px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-6 rounded-[32px] border border-[#dbcbb8] bg-white p-6 shadow-[0_24px_90px_rgba(23,20,15,0.12)] sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8a7765]">
              Admin Dashboard
            </p>
            <h1 className="mt-3 text-4xl tracking-[-0.04em] text-[#1b1511]">
              Artytect Admin
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#665b4f]">
              Manage your pottery website content, categories, products, and classes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.25em] text-[#8a7765]">
                Signed in as
              </p>
              <p className="mt-1 text-sm font-medium text-[#1b1511]">{userEmail}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-12 rounded-full border-[#d9ccbc] bg-transparent text-[#1b1511] hover:bg-[#f5eee4]"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Categories Card */}
          <Link
            href="/admin/categories"
            className="group rounded-[32px] border border-[#dbcbb8] bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#d7b68b] text-[#1b1511]">
                <FolderOpen className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-medium tracking-[-0.03em] text-[#1b1511]">
                  Categories
                </h2>
                <p className="mt-1 text-sm text-[#665b4f]">
                  {categoriesCount} {categoriesCount === 1 ? 'category' : 'categories'}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#665b4f]">
              Manage product categories, create new ones, and organize your collections.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#1b1511] transition group-hover:gap-3">
              Manage Categories
              <span>→</span>
            </div>
          </Link>

          {/* Products Card */}
          <div className="rounded-[32px] border border-[#dbcbb8] bg-white p-6 opacity-50 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#b38d67] text-white">
                <Package className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-medium tracking-[-0.03em] text-[#1b1511]">
                  Products
                </h2>
                <p className="mt-1 text-sm text-[#665b4f]">Coming soon</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#665b4f]">
              Add and manage pottery products, pricing, and inventory.
            </p>
          </div>

          {/* Classes Card */}
          <div className="rounded-[32px] border border-[#dbcbb8] bg-white p-6 opacity-50 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#8a7765] text-white">
                <Users className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-medium tracking-[-0.03em] text-[#1b1511]">
                  Classes
                </h2>
                <p className="mt-1 text-sm text-[#665b4f]">Coming soon</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#665b4f]">
              Schedule pottery classes, workshops, and manage registrations.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 rounded-[32px] border border-[#dbcbb8] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-medium tracking-[-0.03em] text-[#1b1511]">
            Quick Actions
          </h2>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/categories"
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#d9ccbc] px-6 text-sm font-medium text-[#1b1511] transition hover:bg-[#f5eee4]"
            >
              View All Categories
            </Link>
            <Link
              href="/admin/create-categories"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#1b1511] px-6 text-sm font-medium text-[#f8f2e8] transition hover:bg-[#2a211a]"
            >
              Create New Category
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminPanel;
