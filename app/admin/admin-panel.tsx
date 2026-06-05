"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FolderOpen, HeartHandshake, Home, Mail, MessageSquareQuote, Newspaper, Package, Route, Sparkles, Users, ChevronRight, BookOpen, BookMarked } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type AdminPanelProps = {
  initialUserEmail: string;
  heroCount: number;
  messagesCount: number;
  categoriesCount: number;
  testimonialsCount: number;
  aboutSectionsCount: number;
  processStepsCount: number;
  craftedMomentsCount: number;
  blogsCount: number;
};

const AdminPanel = ({ initialUserEmail, heroCount, messagesCount, categoriesCount, testimonialsCount, aboutSectionsCount, processStepsCount, craftedMomentsCount, blogsCount }: AdminPanelProps) => {
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
            <div className="mt-4 min-h-12 h-12 inline-flex gap-2 items-center rounded-full bg-[#1b1511] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_16px_32px_rgba(27,21,17,0.14)] transition hover:-translate-y-0.5 hover:bg-[#3a2f27] focus-visible:ring-[#8a5f3b]/30 disabled:translate-y-0">
              Manage hero <ChevronRight className="text-xs" />
            </div>
          </Link>

          <Link
            href="/admin/messages"
            className="group rounded-[32px] bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f4eadf] text-[#1b1511]">
                <Mail className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-medium tracking-[-0.03em] text-[#1b1511]">Messages</h2>
                <p className="mt-1 text-sm text-[#665b4f]">
                  {messagesCount} {messagesCount === 1 ? "message" : "messages"}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#665b4f]">
              Review, filter, export, and delete contact form submissions.
            </p>
          
            <div className="mt-4 min-h-12 h-12 inline-flex gap-2 items-center rounded-full bg-[#1b1511] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_16px_32px_rgba(27,21,17,0.14)] transition hover:-translate-y-0.5 hover:bg-[#3a2f27] focus-visible:ring-[#8a5f3b]/30 disabled:translate-y-0">
              Manage Messages <ChevronRight className="text-xs" />
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
           
            <div className="mt-4 min-h-12 h-12 inline-flex gap-2 items-center rounded-full bg-[#1b1511] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_16px_32px_rgba(27,21,17,0.14)] transition hover:-translate-y-0.5 hover:bg-[#3a2f27] focus-visible:ring-[#8a5f3b]/30 disabled:translate-y-0">
              Manage Categories <ChevronRight className="text-xs" />
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
            <div className="mt-4 min-h-12 h-12 inline-flex gap-2 items-center rounded-full bg-[#1b1511] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_16px_32px_rgba(27,21,17,0.14)] transition hover:-translate-y-0.5 hover:bg-[#3a2f27] focus-visible:ring-[#8a5f3b]/30 disabled:translate-y-0">
              Manage Testimonials <ChevronRight className="text-xs" />
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
            <div className="mt-4 min-h-12 h-12 inline-flex gap-2 items-center rounded-full bg-[#1b1511] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_16px_32px_rgba(27,21,17,0.14)] transition hover:-translate-y-0.5 hover:bg-[#3a2f27] focus-visible:ring-[#8a5f3b]/30 disabled:translate-y-0">
              Manage About <ChevronRight className="text-xs" />
            </div>
          </Link>

          <Link
            href="/admin/our-story"
            className="group rounded-[32px] bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e8ddd1] text-[#1b1511]">
                <BookOpen className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-medium tracking-[-0.03em] text-[#1b1511]">Our Story</h2>
                <p className="mt-1 text-sm text-[#665b4f]">Brand story page</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#665b4f]">
              Manage hero, content, values, timeline, and team sections.
            </p>
            <div className="mt-4 min-h-12 h-12 inline-flex gap-2 items-center rounded-full bg-[#1b1511] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_16px_32px_rgba(27,21,17,0.14)] transition hover:-translate-y-0.5 hover:bg-[#3a2f27] focus-visible:ring-[#8a5f3b]/30 disabled:translate-y-0">
              Manage Our Story <ChevronRight className="text-xs" />
            </div>
          </Link>

          <Link
            href="/admin/contact"
            className="group rounded-[32px] bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e8ddd1] text-[#1b1511]">
                <Mail className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-medium tracking-[-0.03em] text-[#1b1511]">Contact</h2>
                <p className="mt-1 text-sm text-[#665b4f]">Contact page</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#665b4f]">
              Manage contact page hero section, contact details, and map embed.
            </p>
            <div className="mt-4 min-h-12 h-12 inline-flex gap-2 items-center rounded-full bg-[#1b1511] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_16px_32px_rgba(27,21,17,0.14)] transition hover:-translate-y-0.5 hover:bg-[#3a2f27] focus-visible:ring-[#8a5f3b]/30 disabled:translate-y-0">
              Manage Contact <ChevronRight className="text-xs" />
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
            <div className="mt-4 min-h-12 h-12 inline-flex gap-2 items-center rounded-full bg-[#1b1511] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_16px_32px_rgba(27,21,17,0.14)] transition hover:-translate-y-0.5 hover:bg-[#3a2f27] focus-visible:ring-[#8a5f3b]/30 disabled:translate-y-0">
              Manage Process <ChevronRight className="text-xs" />
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
            <div className="mt-4 min-h-12 h-12 inline-flex gap-2 items-center rounded-full bg-[#1b1511] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_16px_32px_rgba(27,21,17,0.14)] transition hover:-translate-y-0.5 hover:bg-[#3a2f27] focus-visible:ring-[#8a5f3b]/30 disabled:translate-y-0">
              Manage Crafted Moments <ChevronRight className="text-xs" />
            </div>
          </Link>

          <Link
            href="/admin/blogs"
            className="group rounded-[32px] bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fff7e8] text-[#1b1511]">
                <Newspaper className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-medium tracking-[-0.03em] text-[#1b1511]">Blogs</h2>
                <p className="mt-1 text-sm text-[#665b4f]">
                  {blogsCount} {blogsCount === 1 ? "blog" : "blogs"}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#665b4f]">
              Create, edit, publish, and organize studio journal stories.
            </p>
            <div className="mt-4 min-h-12 h-12 inline-flex gap-2 items-center rounded-full bg-[#1b1511] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_16px_32px_rgba(27,21,17,0.14)] transition hover:-translate-y-0.5 hover:bg-[#3a2f27] focus-visible:ring-[#8a5f3b]/30 disabled:translate-y-0">
              Manage Blogs <ChevronRight className="text-xs" />
            </div>
          </Link>

          <Link
            href="/admin/products"
            className="group rounded-[32px] bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#b38d67] text-white">
                <Package className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-medium tracking-[-0.03em] text-[#1b1511]">Products</h2>
                <p className="mt-1 text-sm text-[#665b4f]">Manage products</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#665b4f]">
              Add and manage pottery products, pricing, and inventory.
            </p>
            <div className="mt-4 min-h-12 h-12 inline-flex gap-2 items-center rounded-full bg-[#1b1511] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_16px_32px_rgba(27,21,17,0.14)] transition hover:-translate-y-0.5 hover:bg-[#3a2f27] focus-visible:ring-[#8a5f3b]/30 disabled:translate-y-0">
              Manage Products <ChevronRight className="text-xs" />
            </div>
          </Link>

          <Link
            href="/admin/class-bookings"
            className="group rounded-[32px] bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dcd4c8] text-[#1b1511]">
                <BookMarked className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-medium tracking-[-0.03em] text-[#1b1511]">Bookings</h2>
                <p className="mt-1 text-sm text-[#665b4f]">Class bookings</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#665b4f]">
              Manage class bookings, verify payments, and confirm registrations.
            </p>
            <div className="mt-4 min-h-12 h-12 inline-flex gap-2 items-center rounded-full bg-[#1b1511] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_16px_32px_rgba(27,21,17,0.14)] transition hover:-translate-y-0.5 hover:bg-[#3a2f27] focus-visible:ring-[#8a5f3b]/30 disabled:translate-y-0">
              Manage Bookings <ChevronRight className="text-xs" />
            </div>
          </Link>

          <Link
            href="/admin/classes"
            className="group rounded-[32px] bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#8a7765] text-white">
                <Users className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-medium tracking-[-0.03em] text-[#1b1511]">Classes</h2>
                <p className="mt-1 text-sm text-[#665b4f]">Pottery classes</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#665b4f]">
              Schedule pottery classes, workshops, and manage registrations.
            </p>
            <div className="mt-4 min-h-12 h-12 inline-flex gap-2 items-center rounded-full bg-[#1b1511] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_16px_32px_rgba(27,21,17,0.14)] transition hover:-translate-y-0.5 hover:bg-[#3a2f27] focus-visible:ring-[#8a5f3b]/30 disabled:translate-y-0">
              Manage Classes <ChevronRight className="text-xs" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
