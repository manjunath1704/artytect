"use client";

/**
 * app/template.tsx
 *
 * Next.js App Router re-mounts this file on EVERY route change (unlike
 * layout.tsx which persists). This makes it the correct place to drive
 * page transitions — AnimatePresence gets a clean unmount/mount cycle
 * for every navigation automatically, with no pathname-watching needed.
 *
 * AnimatePresence mode="wait" ensures the exit animation completes before
 * the entering page mounts, preventing two pages from overlapping.
 *
 * usePathname() is used as the key so dynamic segments like /products/[slug]
 * each get their own animation cycle, not just top-level route changes.
 */

import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import PageTransition from "@/components/shared/PageTransition";
import ScrollToTop from "@/components/shared/ScrollToTop";

export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      {/* Scroll to top before the enter animation begins */}
      <ScrollToTop />

      <AnimatePresence mode="wait">
        <PageTransition key={pathname}>
          {children}
        </PageTransition>
      </AnimatePresence>
    </>
  );
}
