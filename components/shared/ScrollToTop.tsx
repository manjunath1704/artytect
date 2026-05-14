"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * ScrollToTop
 *
 * Scrolls the window to the top on every route change.
 * Placed inside app/template.tsx so it fires on every navigation.
 *
 * Uses "instant" behavior so the scroll happens before the enter animation
 * begins — the user never sees the previous scroll position on the new page.
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // "instant" avoids fighting with the CSS scroll-behavior: smooth on <html>
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
