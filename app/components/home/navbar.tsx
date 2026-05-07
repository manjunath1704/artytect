"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "/#collections" },
  { label: "About", href: "/#about" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Shop", href: "/products" },
  { label: "Contact", href: "/contact" },
];

const Navbar = ({ forceSolid = false }: { forceSolid?: boolean }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const showSolid = forceSolid || isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-50 -mb-20 transition-colors duration-300",
        showSolid
          ? "border-b border-black/8 bg-white/95 text-black shadow-[0_12px_40px_rgba(23,20,15,0.12)] backdrop-blur-md"
          : "bg-transparent text-white",
      ].join(" ")}
    >
      <div className="site-container flex h-20 items-center justify-between">
        <Link href="/" className="font-display text-2xl tracking-[0.22em] text-inherit sm:text-3xl">
          ARTYTECT
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium tracking-[0.08em] text-inherit transition-opacity hover:opacity-70"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className={[
            "inline-flex h-11 w-11 items-center justify-center border transition md:hidden",
            showSolid
              ? "border-black/10 bg-black/5 text-black hover:bg-black/10"
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
              "origin-top overflow-hidden border px-4 py-4 shadow-[0_18px_60px_rgba(23,20,15,0.18)] backdrop-blur-xl transition-all duration-300 ease-out",
              showSolid
                ? "border-black/10 bg-white/95 text-black"
                : "border-white/10 bg-black/92 text-white",
              isOpen ? "scale-100" : "scale-[0.98]",
            ].join(" ")}
          >
            <nav className="grid gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={[
                    "px-3 py-3 text-sm font-medium tracking-[0.08em] transition",
                    showSolid ? "hover:bg-black/5" : "hover:bg-white/10",
                  ].join(" ")}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
