"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Categories", href: "/categories" },
  { label: "Products", href: "/products" },
  { label: "Classes", href: "/classes" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

type NavbarProps = {
  forceSolid?: boolean;
  transparentTone?: "light" | "dark";
};

const Navbar = ({
  forceSolid = false,
  transparentTone = "light",
}: NavbarProps) => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const showSolid = forceSolid || isScrolled;
  const transparentIsDark = transparentTone === "dark";

  // Determine which logo to show
  const logoSrc = showSolid 
    ? "/logo/logo-brand.svg" 
    : transparentIsDark 
      ? "/logo/logo-brand.svg" 
      : "/logo/logo-light.svg";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setActiveHash(window.location.hash);
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [pathname]);

  const isActiveItem = (href: string) => {
    if (href === "/") {
      return pathname === "/" && !activeHash;
    }

    if (href === "/categories") {
      return pathname.startsWith("/categories");
    }

    if (href === "/#collections") {
      return pathname.startsWith("/categories") || (pathname === "/" && activeHash === "#collections");
    }

    if (href.startsWith("/#")) {
      const hash = href.replace("/", "");
      return pathname === "/" && activeHash === hash;
    }

    if (href === "/products") {
      return pathname.startsWith("/products");
    }

    if (href === "/classes") {
      return pathname.startsWith("/classes");
    }

    if (href === "/blog") {
      return pathname.startsWith("/blog");
    }

    return pathname === href;
  };

  return (
    <header
      className={[
        "sticky top-0 z-50 -mb-20 transition-colors duration-300",
        showSolid
          ? "border-b border-black/8 bg-white/95 text-black  backdrop-blur-md"
          : transparentIsDark
            ? "bg-transparent text-[#1b1511]"
            : "bg-transparent text-white",
      ].join(" ")}
    >
      <div className="site-container flex h-20 items-center justify-between">
        <Link href="/" className="relative h-16 w-80 transition-opacity hover:opacity-80">
          <Image
            src={logoSrc}
            alt="Haritham"
            fill
            className="object-contain object-left"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => {
            const isActive = isActiveItem(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "relative py-2 text-sm font-medium tracking-[0.08em] text-inherit transition-opacity after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:bg-current after:transition-transform hover:opacity-70",
                  isActive ? "opacity-100 after:scale-x-100" : "after:scale-x-0",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className={[
            "inline-flex h-11 w-11 items-center justify-center rounded-full border transition md:hidden",
            showSolid
              ? "border-black/10 bg-black/5 text-black hover:bg-black/10"
              : transparentIsDark
                ? isOpen
                  ? "border-black/15 bg-white/90 text-black hover:bg-white"
                  : "border-black/15 bg-white/40 text-black hover:bg-white/70"
                : isOpen
                  ? "border-white/20 bg-black/70 text-white hover:bg-black/80"
                  : "border-white/20 bg-white/10 text-white hover:bg-white/15",
          ].join(" ")}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={[
          "pointer-events-none absolute left-0 right-0 top-full z-40 pt-3 md:hidden",
          "transition-all duration-300 ease-out",
          isOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "translate-y-[-0.5rem] opacity-0",
        ].join(" ")}
      >
        <div className="site-container">
          <div
            className={[
              "origin-top overflow-hidden rounded-[28px] border px-4 py-4 shadow-[0_18px_60px_rgba(23,20,15,0.18)] backdrop-blur-xl transition-all duration-300 ease-out",
              showSolid
                ? "border-black/10 bg-white/95 text-black"
                : transparentIsDark
                  ? "border-black/10 bg-white/95 text-black"
                  : "border-white/10 bg-black/92 text-white",
              isOpen ? "scale-100" : "scale-[0.98]",
            ].join(" ")}
          >
            <nav className="grid gap-1">
              {navItems.map((item) => {
                const isActive = isActiveItem(item.href);

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={[
                      "rounded-full px-3 py-3 text-sm font-medium tracking-[0.08em] transition",
                      showSolid
                        ? isActive
                          ? "bg-black text-white"
                          : "hover:bg-black/5"
                        : isActive
                          ? "bg-white text-[#1b1511]"
                          : "hover:bg-white/10",
                    ].join(" ")}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
