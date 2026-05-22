"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FolderOpen, Package, Users } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type AdminPanelProps = {
  initialUserEmail: string;
  categoriesCount: number;
};

const AdminPanel = ({ initialUserEmail, categoriesCount }: AdminPanelProps) => {
  const router = useRouter();

  useEffect(() => {
    const syncSession = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) router.replace("/admin/login");
    };
    void syncSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) router.replace("/admin/login");
    });
    return () => subscription.unsubscribe();
  }, [initialUserEmail, router]);

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Welcome banner */}
        <div className="rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8a7765]">
            Admin Dashboard
          </p>
          <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b1511]">
            Welcome back
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#665b4f]">
            Manage your pottery website content, categories, products, and classes.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/categories"
            className="group rounded-[32px] bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#d7b68b] text-[#1b1511]">
                <FolderOpen className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-medium tracking-[-0.03em] text-[#1b1511]">Categories</h2>
                <p className="mt-1 text-sm text-[#665b4f]">
                  {categoriesCount} {categoriesCount === 1 ? "category" : "categories"}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#665b4f]">
              Manage product categories, create new ones, and organize your collections.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#1b1511] transition group-hover:gap-3">
              Manage Categories <span>→</span>
            </div>
          </Link>

          <div className="rounded-[32px] bg-white p-6 opacity-50 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#b38d67] text-white">
                <Package className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-medium tracking-[-0.03em] text-[#1b1511]">Products</h2>
                <p className="mt-1 text-sm text-[#665b4f]">Coming soon</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#665b4f]">
              Add and manage pottery products, pricing, and inventory.
            </p>
          </div>

          <div className="rounded-[32px] bg-white p-6 opacity-50 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#8a7765] text-white">
                <Users className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-medium tracking-[-0.03em] text-[#1b1511]">Classes</h2>
                <p className="mt-1 text-sm text-[#665b4f]">Coming soon</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#665b4f]">
              Schedule pottery classes, workshops, and manage registrations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
