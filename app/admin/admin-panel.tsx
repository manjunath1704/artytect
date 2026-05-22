"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FolderOpen, HeartHandshake, Home, MessageSquareQuote, Package, Route, Sparkles, Users } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type AdminPanelProps = {
  initialUserEmail: string;
  heroCount: number;
  categoriesCount: number;
  testimonialsCount: number;
  aboutSectionsCount: number;
  processStepsCount: number;
  craftedMomentsCount: number;
};

const AdminPanel = ({ initialUserEmail, heroCount, categoriesCount, testimonialsCount, aboutSectionsCount, processStepsCount, craftedMomentsCount }: AdminPanelProps) => {
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
            Manage your pottery website content, categories, testimonials, products, and classes.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/hero"
            className="group rounded-[32px] bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1b1511] text-[#f8f2e8]">
                <Home className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-medium tracking-[-0.03em] text-[#1b1511]">Hero</h2>
                <p className="mt-1 text-sm text-[#665b4f]">
                  {heroCount ? "Configured" : "Not configured"}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#665b4f]">
              Edit homepage hero copy, button, poster, and video backgrounds.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#1b1511] transition group-hover:gap-3">
              Manage Hero <span>→</span>
            </div>
          </Link>

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

          <Link
            href="/admin/testimonials"
            className="group rounded-[32px] bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f5eee4] text-[#1b1511]">
                <MessageSquareQuote className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-medium tracking-[-0.03em] text-[#1b1511]">Testimonials</h2>
                <p className="mt-1 text-sm text-[#665b4f]">
                  {testimonialsCount} {testimonialsCount === 1 ? "testimonial" : "testimonials"}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#665b4f]">
              Create and manage customer stories shown in the community section.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#1b1511] transition group-hover:gap-3">
              Manage Testimonials <span>→</span>
            </div>
          </Link>

          <Link
            href="/admin/about-sections"
            className="group rounded-[32px] bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fff0eb] text-[#1b1511]">
                <HeartHandshake className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-medium tracking-[-0.03em] text-[#1b1511]">About</h2>
                <p className="mt-1 text-sm text-[#665b4f]">
                  {aboutSectionsCount} {aboutSectionsCount === 1 ? "section" : "sections"}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#665b4f]">
              Manage the homepage creator story and call-to-action.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#1b1511] transition group-hover:gap-3">
              Manage About <span>→</span>
            </div>
          </Link>

          <Link
            href="/admin/process"
            className="group rounded-[32px] bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fcfdfa] text-[#1b1511]">
                <Route className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-medium tracking-[-0.03em] text-[#1b1511]">Process</h2>
                <p className="mt-1 text-sm text-[#665b4f]">
                  {processStepsCount} {processStepsCount === 1 ? "step" : "steps"}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#665b4f]">
              Edit section titles and manage the process step collection.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#1b1511] transition group-hover:gap-3">
              Manage Process <span>→</span>
            </div>
          </Link>

          <Link
            href="/admin/crafted-moments"
            className="group rounded-[32px] bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f5eee4] text-[#1b1511]">
                <Sparkles className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-medium tracking-[-0.03em] text-[#1b1511]">Crafted Moments</h2>
                <p className="mt-1 text-sm text-[#665b4f]">
                  {craftedMomentsCount} {craftedMomentsCount === 1 ? "item" : "items"}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#665b4f]">
              Edit the studio moments header and manage image or video tiles.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#1b1511] transition group-hover:gap-3">
              Manage Crafted Moments <span>→</span>
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
