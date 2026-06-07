"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  ShoppingBag,
  BookMarked,
  Settings,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowUpRight,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const formatCurrency = (val: number) => {
  return val.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

type AdminPanelProps = {
  initialUserEmail: string;
  messagesCount: number;
  ordersCount: number;
  pendingOrdersCount: number;
  monthlyOrdersRevenue: number;
  totalOrdersRevenue: number;
  bookingsCount: number;
  pendingBookingsCount: number;
  monthlyBookingsRevenue: number;
  totalBookingsRevenue: number;
  isQrConfigured: boolean;
};

const AdminPanel = ({
  initialUserEmail,
  messagesCount,
  ordersCount,
  pendingOrdersCount,
  monthlyOrdersRevenue,
  totalOrdersRevenue,
  bookingsCount,
  pendingBookingsCount,
  monthlyBookingsRevenue,
  totalBookingsRevenue,
  isQrConfigured,
}: AdminPanelProps) => {
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

  const currentMonthName = new Date().toLocaleString("default", { month: "long" });
  const totalMonthlyCombinedRevenue = monthlyOrdersRevenue + monthlyBookingsRevenue;
  const totalCombinedRevenue = totalOrdersRevenue + totalBookingsRevenue;
  const totalPendingActions = pendingOrdersCount + pendingBookingsCount;

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Welcome banner */}
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-white to-[#fbf9f6] p-6 shadow-sm sm:p-8 border border-[#efe6dc]/60">
          <div className="absolute right-0 top-0 -mr-6 -mt-6 h-36 w-36 rounded-full bg-[#f6efe4] opacity-50 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8a7765]">
              System Overview
            </p>
            <h1 className="mt-2 text-3xl font-normal tracking-[-0.04em] text-[#1b1511] sm:text-4xl">
              Welcome back
            </h1>
            <p className="mt-2.5 max-w-2xl text-sm leading-6 text-[#665b4f]">
              Quick operational overview of orders, workshop bookings, customer inquiries, and payment settings.
            </p>
          </div>
        </div>

        {/* Quick Insights Grid */}
        <div className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
          {/* Stat 1: Monthly Combined Sales */}
          <div className="rounded-2xl border border-[#efe6dc]/50 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-[0.05em] text-[#8a7765]">
                {currentMonthName} Revenue
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fcf4f0] text-[#c87a53]">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-semibold tracking-[-0.03em] text-[#1b1511]">
                ₹{formatCurrency(totalMonthlyCombinedRevenue)}
              </h3>
              <p className="mt-1 text-[11px] text-[#8a7765] flex flex-col gap-0.5">
                <span className="flex items-center gap-1">
                  <span>Orders: ₹{formatCurrency(monthlyOrdersRevenue)}</span>
                  <span className="opacity-50">•</span>
                  <span>Bookings: ₹{formatCurrency(monthlyBookingsRevenue)}</span>
                </span>
                <span className="text-[9px] text-[#a69280] mt-0.5">
                  All-time: ₹{formatCurrency(totalCombinedRevenue)}
                </span>
              </p>
            </div>
          </div>

          {/* Stat 2: Pending Actions */}
          <div className="rounded-2xl border border-[#efe6dc]/50 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-[0.05em] text-[#8a7765]">
                Pending Actions
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fff8eb] text-[#b45309]">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-semibold tracking-[-0.03em] text-[#1b1511]">
                {totalPendingActions}
              </h3>
              <p className="mt-1 text-[11px] text-[#8a7765] flex items-center gap-1">
                <span>{pendingOrdersCount} orders</span>
                <span className="opacity-50">•</span>
                <span>{pendingBookingsCount} bookings</span>
              </p>
            </div>
          </div>

          {/* Stat 3: Contact Messages */}
          <div className="rounded-2xl border border-[#efe6dc]/50 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-[0.05em] text-[#8a7765]">
                Total Messages
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0f9ff] text-[#0369a1]">
                <Mail className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-semibold tracking-[-0.03em] text-[#1b1511]">
                {messagesCount}
              </h3>
              <p className="mt-1 text-[11px] text-[#8a7765]">
                Inbox customer messages
              </p>
            </div>
          </div>

          {/* Stat 4: QR Config Status */}
          <div className="rounded-2xl border border-[#efe6dc]/50 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-[0.05em] text-[#8a7765]">
                Payment Setup
              </span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                isQrConfigured ? "bg-[#f0fdf4] text-[#166534]" : "bg-[#fef2f2] text-[#991b1b]"
              }`}>
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className={`text-lg font-semibold tracking-tight ${
                isQrConfigured ? "text-[#166534]" : "text-[#991b1b]"
              }`}>
                {isQrConfigured ? "Configured" : "Incomplete"}
              </h3>
              <p className="mt-1.5 text-[11px] text-[#8a7765]">
                Payment QR Code config
              </p>
            </div>
          </div>
        </div>

        {/* Action Cards Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {/* Card 1: Orders */}
          <div className="group relative overflow-hidden rounded-[32px] border border-[#efe6dc]/60 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-8">
            <div className="flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fcf4f0] text-[#c87a53] transition-colors group-hover:bg-[#c87a53] group-hover:text-white duration-300">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <Link
                href="/admin/orders"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fbf8f4] text-[#8a7765] transition-all hover:bg-[#1b1511] hover:text-[#f8f2e8]"
              >
                <ArrowUpRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="mt-6">
              <h2 className="text-2xl font-medium tracking-[-0.03em] text-[#1b1511]">
                Orders
              </h2>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-[#1b1511]">{ordersCount}</span>
                <span className="text-xs text-[#8a7765] font-normal uppercase tracking-wider">Total</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#665b4f]">
                Manage product orders, verify customer payments, track shipping statuses, and process deliveries.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-[#efe6dc]/40 pt-4">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                pendingOrdersCount > 0 ? "bg-[#fff8eb] text-[#b45309]" : "bg-[#f0fdf4] text-[#166534]"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${
                  pendingOrdersCount > 0 ? "bg-[#b45309] animate-pulse" : "bg-[#166534]"
                }`} />
                {pendingOrdersCount} pending confirmation
              </span>
              <Link
                href="/admin/orders"
                className="text-xs font-semibold uppercase tracking-wider text-[#1b1511] hover:text-[#8a7765] flex items-center gap-1"
              >
                View Orders <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Card 2: Bookings */}
          <div className="group relative overflow-hidden rounded-[32px] border border-[#efe6dc]/60 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-8">
            <div className="flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f4f6f0] text-[#7d8c60] transition-colors group-hover:bg-[#7d8c60] group-hover:text-white duration-300">
                <BookMarked className="h-7 w-7" />
              </div>
              <Link
                href="/admin/class-bookings"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fbf8f4] text-[#8a7765] transition-all hover:bg-[#1b1511] hover:text-[#f8f2e8]"
              >
                <ArrowUpRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="mt-6">
              <h2 className="text-2xl font-medium tracking-[-0.03em] text-[#1b1511]">
                Bookings
              </h2>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-[#1b1511]">{bookingsCount}</span>
                <span className="text-xs text-[#8a7765] font-normal uppercase tracking-wider">Total</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#665b4f]">
                Review class registrations, confirm reservation seats, verify transaction screenshots, and manage student attendance.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-[#efe6dc]/40 pt-4">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                pendingBookingsCount > 0 ? "bg-[#fff8eb] text-[#b45309]" : "bg-[#f0fdf4] text-[#166534]"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${
                  pendingBookingsCount > 0 ? "bg-[#b45309] animate-pulse" : "bg-[#166534]"
                }`} />
                {pendingBookingsCount} verification pending
              </span>
              <Link
                href="/admin/class-bookings"
                className="text-xs font-semibold uppercase tracking-wider text-[#1b1511] hover:text-[#8a7765] flex items-center gap-1"
              >
                View Bookings <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Card 3: Messages */}
          <div className="group relative overflow-hidden rounded-[32px] border border-[#efe6dc]/60 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-8">
            <div className="flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fbf8f4] text-[#8a7765] transition-colors group-hover:bg-[#8a7765] group-hover:text-white duration-300">
                <Mail className="h-7 w-7" />
              </div>
              <Link
                href="/admin/messages"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fbf8f4] text-[#8a7765] transition-all hover:bg-[#1b1511] hover:text-[#f8f2e8]"
              >
                <ArrowUpRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="mt-6">
              <h2 className="text-2xl font-medium tracking-[-0.03em] text-[#1b1511]">
                Messages
              </h2>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-[#1b1511]">{messagesCount}</span>
                <span className="text-xs text-[#8a7765] font-normal uppercase tracking-wider">Messages</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#665b4f]">
                Read and manage customer inquiries, feedback submissions, and general contact messages from your site.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-[#efe6dc]/40 pt-4">
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-[#fcfaf7] text-[#8a7765] border border-[#efe6dc]/30">
                Contact Form Submissions
              </span>
              <Link
                href="/admin/messages"
                className="text-xs font-semibold uppercase tracking-wider text-[#1b1511] hover:text-[#8a7765] flex items-center gap-1"
              >
                View Messages <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Card 4: Settings */}
          <div className="group relative overflow-hidden rounded-[32px] border border-[#efe6dc]/60 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-8">
            <div className="flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5f6f8] text-[#6b7280] transition-colors group-hover:bg-[#6b7280] group-hover:text-white duration-300">
                <Settings className="h-7 w-7" />
              </div>
              <Link
                href="/admin/settings"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fbf8f4] text-[#8a7765] transition-all hover:bg-[#1b1511] hover:text-[#f8f2e8]"
              >
                <ArrowUpRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="mt-6">
              <h2 className="text-2xl font-medium tracking-[-0.03em] text-[#1b1511]">
                Settings
              </h2>
              <div className="mt-2 flex items-baseline gap-2">
                <span className={`text-sm font-semibold uppercase tracking-wider ${
                  isQrConfigured ? "text-[#166534]" : "text-[#991b1b]"
                }`}>
                  {isQrConfigured ? "Active" : "Action Required"}
                </span>
              </div>
              <p className="mt-3.5 text-sm leading-6 text-[#665b4f]">
                Manage website credentials, update payment QR code for buyer verification, and customize checkout details.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-[#efe6dc]/40 pt-4">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                isQrConfigured ? "bg-[#f0fdf4] text-[#166534]" : "bg-[#fef2f2] text-[#991b1b]"
              }`}>
                Payment QR: {isQrConfigured ? "Setup done" : "Setup missing"}
              </span>
              <Link
                href="/admin/settings"
                className="text-xs font-semibold uppercase tracking-wider text-[#1b1511] hover:text-[#8a7765] flex items-center gap-1"
              >
                Open Settings <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
