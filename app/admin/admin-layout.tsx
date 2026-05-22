"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  HeartHandshake,
  Home,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquareQuote,
  Package,
  Plus,
  Route,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// ─── constants ────────────────────────────────────────────────────────────────
const W_EXPANDED  = 256;
const W_COLLAPSED = 68;

// ─── breadcrumb config ────────────────────────────────────────────────────────
const BREADCRUMBS: Record<string, { label: string; parent?: string }> = {
  "/admin":                   { label: "Dashboard" },
  "/admin/hero":              { label: "Hero", parent: "/admin" },
  "/admin/messages":          { label: "Messages", parent: "/admin" },
  "/admin/categories":        { label: "Categories",      parent: "/admin" },
  "/admin/create-categories": { label: "Create Category", parent: "/admin/categories" },
  "/admin/testimonials":        { label: "Testimonials",      parent: "/admin" },
  "/admin/create-testimonials": { label: "Create Testimonial", parent: "/admin/testimonials" },
  "/admin/about-sections":        { label: "About Sections",      parent: "/admin" },
  "/admin/create-about-sections": { label: "Create About Section", parent: "/admin/about-sections" },
  "/admin/process": { label: "Process", parent: "/admin" },
  "/admin/crafted-moments": { label: "Crafted Moments", parent: "/admin" },
};

function useBreadcrumbs(pathname: string) {
  const crumbs: { href: string; label: string }[] = [];
  let current: string | undefined = pathname;
  while (current && BREADCRUMBS[current]) {
    const { label, parent } = BREADCRUMBS[current];
    crumbs.unshift({ href: current, label });
    current = parent as string | undefined;
  }
  return crumbs;
}

// ─── nav config ───────────────────────────────────────────────────────────────
type NavChild = { title: string; href: string };
type NavItem  = {
  title:     string;
  href:      string;
  icon:      React.ElementType;
  disabled?: boolean;
  children:  NavChild[];
};

const NAV: NavItem[] = [
  { title: "Dashboard",  href: "/admin",            icon: LayoutDashboard, children: [] },
  { title: "Hero", href: "/admin/hero", icon: Home, children: [] },
  { title: "Messages", href: "/admin/messages", icon: Mail, children: [] },
  {
    title: "Categories", href: "/admin/categories", icon: FolderOpen,
    children: [
      { title: "View All",   href: "/admin/categories" },
      { title: "Create New", href: "/admin/create-categories" },
    ],
  },
  {
    title: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote,
    children: [
      { title: "View All",   href: "/admin/testimonials" },
      { title: "Create New", href: "/admin/create-testimonials" },
    ],
  },
  {
    title: "About", href: "/admin/about-sections", icon: HeartHandshake,
    children: [
      { title: "View All", href: "/admin/about-sections" },
      { title: "Create New", href: "/admin/create-about-sections" },
    ],
  },
  { title: "Process", href: "/admin/process", icon: Route, children: [] },
  { title: "Crafted Moments", href: "/admin/crafted-moments", icon: Sparkles, children: [] },
  { title: "Products", href: "#", icon: Package, disabled: true, children: [] },
  { title: "Classes",  href: "#", icon: Users,   disabled: true, children: [] },
];

// ─── animation constants ──────────────────────────────────────────────────────
const EASE_SPRING = [0.4, 0, 0.2, 1] as const;
const LABEL_IN    = { duration: 0.16, ease: "easeOut" as const };
const LABEL_OUT   = { duration: 0.10, ease: "easeIn"  as const };
const SUB_IN      = { duration: 0.22, ease: "easeOut" as const };
const SUB_OUT     = { duration: 0.16, ease: "easeIn"  as const };

// ─── AnimLabel ────────────────────────────────────────────────────────────────
function AnimLabel({ children, show }: { children: React.ReactNode; show: boolean }) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.span
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0, transition: LABEL_IN }}
          exit={{ opacity: 0, x: -6, transition: LABEL_OUT }}
          className="contents"
        >
          {children}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

// ─── NavIcon with tooltip when collapsed ─────────────────────────────────────
function NavIcon({
  icon: Icon,
  label,
  collapsed,
}: {
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
}) {
  const icon = <Icon className="h-[18px] w-[18px] shrink-0" />;
  if (!collapsed) return icon;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="flex items-center justify-center">{icon}</span>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={12}
        className="rounded-lg bg-[#1b1511] px-2.5 py-1.5 text-xs text-[#f8f2e8]"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

// ─── Sidebar inner content (shared between desktop + mobile drawer) ───────────
function SidebarContent({
  collapsed,
  isMobile,
  pathname,
  userEmail,
  openGroups,
  onToggleGroup,
  onLogout,
  onClose,
}: {
  collapsed:      boolean;
  isMobile:       boolean;
  pathname:       string;
  userEmail:      string;
  openGroups:     Record<string, boolean>;
  onToggleGroup:  (title: string) => void;
  onLogout:       () => void;
  onClose?:       () => void;
}) {
  // On mobile the sidebar is always "expanded" (full width drawer)
  const isCollapsed = !isMobile && collapsed;

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div
        className={`flex h-14 shrink-0 items-center border-b border-[#e8ddd1] transition-all duration-300 ${
          isCollapsed ? "justify-center px-0" : "px-4"
        }`}
      >
        <Link href="/admin" className="flex items-center gap-3 overflow-hidden" onClick={onClose}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1b1511] text-[#f8f2e8] text-xs font-bold">
            A
          </div>
          <AnimLabel show={!isCollapsed}>
            <span className="whitespace-nowrap text-sm font-semibold text-[#1b1511]">
              Artytect Admin
            </span>
          </AnimLabel>
        </Link>

        {/* Mobile close button */}
        {isMobile && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-[#665b4f] hover:bg-[#f5eee4]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4">
        <AnimLabel show={!isCollapsed}>
          <p className="mb-2 px-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8a7765]">
            Navigation
          </p>
        </AnimLabel>

        <ul className={`space-y-0.5 ${isCollapsed ? "px-2" : "px-3"}`}>
          {NAV.map((item) => {
            const Icon     = item.icon;
            const isActive =
              item.href !== "#" &&
              (pathname === item.href || item.children.some((c) => pathname === c.href));
            const isOpen   = !!openGroups[item.title];

            const rowBase = `flex w-full items-center rounded-xl text-sm transition-colors duration-150 ${
              isCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
            }`;
            const rowActive   = "bg-[#f5eee4] text-[#1b1511] font-medium";
            const rowInactive = "text-[#665b4f] hover:bg-[#fcfaf7] hover:text-[#1b1511]";

            return (
              <li key={item.title}>
                {/* ── Group trigger ── */}
                {item.children.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => onToggleGroup(item.title)}
                    className={`${rowBase} ${isActive ? rowActive : rowInactive}`}
                  >
                    <NavIcon icon={Icon} label={item.title} collapsed={isCollapsed} />
                    <AnimLabel show={!isCollapsed}>
                      <span className="flex-1 whitespace-nowrap text-left">{item.title}</span>
                    </AnimLabel>
                    <AnimLabel show={!isCollapsed}>
                      <motion.span
                        animate={{ rotate: isOpen ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="inline-flex"
                      >
                        <ChevronRight className="h-3.5 w-3.5 text-[#a69280]" />
                      </motion.span>
                    </AnimLabel>
                  </button>
                ) : item.disabled ? (
                  /* ── Disabled leaf ── */
                  <div className={`${rowBase} cursor-not-allowed opacity-40`}>
                    <NavIcon icon={Icon} label={item.title} collapsed={isCollapsed} />
                    <AnimLabel show={!isCollapsed}>
                      <span className="flex-1 whitespace-nowrap text-[#665b4f]">{item.title}</span>
                    </AnimLabel>
                    <AnimLabel show={!isCollapsed}>
                      <span className="text-[9px] uppercase tracking-wider text-[#a69280]">Soon</span>
                    </AnimLabel>
                  </div>
                ) : (
                  /* ── Leaf link ── */
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`${rowBase} ${isActive ? rowActive : rowInactive}`}
                  >
                    <NavIcon icon={Icon} label={item.title} collapsed={isCollapsed} />
                    <AnimLabel show={!isCollapsed}>
                      <span className="whitespace-nowrap">{item.title}</span>
                    </AnimLabel>
                  </Link>
                )}

                {/* ── Sub-menu ── */}
                {item.children.length > 0 && (
                  <motion.ul
                    animate={
                      isOpen && !isCollapsed
                        ? { height: "auto", opacity: 1, transition: SUB_IN }
                        : { height: 0,      opacity: 0, transition: SUB_OUT }
                    }
                    initial={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-[38px] mt-0.5 space-y-0.5 border-l border-[#e8ddd1] pl-3 pr-1">
                      {item.children.map((child) => {
                        const childActive = pathname === child.href;
                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={onClose}
                              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                                childActive
                                  ? "bg-[#f5eee4] font-medium text-[#1b1511]"
                                  : "text-[#665b4f] hover:bg-[#fcfaf7] hover:text-[#1b1511]"
                              }`}
                            >
                              {child.href.startsWith("/admin/create-") && (
                                <Plus className="h-3 w-3 shrink-0 text-[#a69280]" />
                              )}
                              {child.title}
                            </Link>
                          </li>
                        );
                      })}
                    </div>
                  </motion.ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-[#e8ddd1] p-3">
        <div
          className={`flex items-center overflow-hidden rounded-xl px-2 py-2 ${
            isCollapsed ? "justify-center" : "gap-3"
          }`}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex h-8 w-8 shrink-0 cursor-default items-center justify-center rounded-full bg-[#d7b68b] text-[#1b1511] text-xs font-semibold uppercase">
                {userEmail.charAt(0)}
              </div>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" sideOffset={12} className="rounded-lg bg-[#1b1511] px-2.5 py-1.5 text-xs text-[#f8f2e8]">
                {userEmail}
              </TooltipContent>
            )}
          </Tooltip>

          <AnimLabel show={!isCollapsed}>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-[#1b1511]">{userEmail}</p>
              <p className="text-[10px] text-[#8a7765]">Admin</p>
            </div>
          </AnimLabel>

          <AnimLabel show={!isCollapsed}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-full text-[#665b4f] hover:bg-[#f5eee4] hover:text-[#1b1511]"
              onClick={onLogout}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </AnimLabel>
        </div>
      </div>
    </div>
  );
}

// ─── Main layout ──────────────────────────────────────────────────────────────
interface AdminLayoutProps {
  children:  React.ReactNode;
  userEmail: string;
}

export function AdminLayout({ children, userEmail }: AdminLayoutProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const crumbs   = useBreadcrumbs(pathname);

  const [collapsed,    setCollapsed]    = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [openGroups,   setOpenGroups]   = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    NAV.forEach((item) => {
      if (item.children.some((c) => pathname.startsWith(c.href)) || pathname === item.href) {
        init[item.title] = true;
      }
    });
    return init;
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Collapse sub-menus when sidebar collapses
  useEffect(() => {
    if (collapsed) setOpenGroups({});
  }, [collapsed]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  const toggleGroup = (title: string) => {
    if (collapsed) {
      setCollapsed(false);
      setOpenGroups({ [title]: true });
      return;
    }
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  if (!mounted) return null;

  const sidebarWidth = collapsed ? W_COLLAPSED : W_EXPANDED;

  const sharedSidebarProps = {
    pathname,
    userEmail,
    openGroups,
    onToggleGroup: toggleGroup,
    onLogout:      handleLogout,
  };

  return (
    <TooltipProvider delayDuration={0}>
      {/* Root: full viewport, no body scroll */}
      <div className="flex h-screen overflow-hidden bg-[linear-gradient(180deg,#f6efe4_0%,#efe4d5_100%)]">

        {/* ══════════════════════════════════════════
            DESKTOP SIDEBAR  (md+)
        ══════════════════════════════════════════ */}
        <motion.aside
          animate={{ width: sidebarWidth }}
          transition={{ duration: 0.3, ease: EASE_SPRING }}
          className="relative hidden shrink-0 flex-col overflow-visible border-r border-[#e8ddd1] bg-white md:flex"
          style={{ width: sidebarWidth }}
        >
          <SidebarContent
            {...sharedSidebarProps}
            collapsed={collapsed}
            isMobile={false}
          />

          {/* ── Floating toggle button ── */}
          <motion.button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="absolute -right-3.5 top-[52px] z-30 flex h-7 w-7 items-center justify-center rounded-full border border-[#e8ddd1] bg-white text-[#665b4f] shadow-md transition-colors hover:bg-[#f5eee4] hover:text-[#1b1511]"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              animate={{ rotate: collapsed ? 0 : 180 }}
              transition={{ duration: 0.3, ease: EASE_SPRING }}
              className="inline-flex"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </motion.span>
          </motion.button>
        </motion.aside>

        {/* ══════════════════════════════════════════
            MOBILE DRAWER  (< md)
        ══════════════════════════════════════════ */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
                onClick={() => setMobileOpen(false)}
              />

              {/* Drawer */}
              <motion.aside
                key="drawer"
                initial={{ x: -W_EXPANDED }}
                animate={{ x: 0 }}
                exit={{ x: -W_EXPANDED }}
                transition={{ duration: 0.28, ease: EASE_SPRING }}
                className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#e8ddd1] bg-white shadow-2xl md:hidden"
              >
                <SidebarContent
                  {...sharedSidebarProps}
                  collapsed={false}
                  isMobile={true}
                  onClose={() => setMobileOpen(false)}
                />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════
            MAIN CONTENT AREA
        ══════════════════════════════════════════ */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

          {/* ── Sticky header ── */}
          <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[#e8ddd1] bg-white/90 px-4 backdrop-blur-sm">

            {/* Hamburger — mobile only */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#665b4f] transition hover:bg-[#f5eee4] hover:text-[#1b1511] md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 overflow-hidden text-sm">
              {crumbs.map((crumb, i) => {
                const isLast = i === crumbs.length - 1;
                return (
                  <span key={crumb.href} className="flex shrink-0 items-center gap-1">
                    {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-[#a69280]" />}
                    {isLast ? (
                      <span className="font-medium text-[#1b1511]">{crumb.label}</span>
                    ) : (
                      <Link href={crumb.href} className="text-[#8a7765] transition hover:text-[#1b1511]">
                        {crumb.label}
                      </Link>
                    )}
                  </span>
                );
              })}
            </nav>

            {/* Right: email + logout */}
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden max-w-[160px] truncate text-xs text-[#8a7765] sm:block">
                {userEmail}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-full border-[#d9ccbc] bg-transparent text-[#1b1511] hover:bg-[#f5eee4]"
                onClick={handleLogout}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="ml-1 hidden sm:inline">Logout</span>
              </Button>
            </div>
          </header>

          {/* ── Scrollable page content ── */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
