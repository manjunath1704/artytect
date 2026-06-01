import Link from "next/link";
import type { ReactNode } from "react";

import Navbar from "@/app/components/home/navbar";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footerText: string;
  footerHref: string;
  footerLabel: string;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footerText,
  footerHref,
  footerLabel,
}: AuthShellProps) {
  return (
    <>
      <Navbar forceSolid />
      <main className="min-h-[100svh] bg-[linear-gradient(180deg,#f6efe4_0%,#efe4d5_100%)] px-4 py-10 sm:px-8 lg:px-10 mt-20">
        <div className="mx-auto flex min-h-[calc(100svh-5rem)] max-w-7xl items-center justify-center">
          <section className="grid w-full  overflow-hidden rounded-[10px] bg-white shadow-[0_24px_80px_rgba(27,21,17,0.14)] lg:grid-cols-[1.02fr_0.98fr]">
            <div className="hidden bg-[linear-gradient(160deg,rgba(27,21,17,0.96),rgba(58,45,36,0.94)),url('/images/gallery/pexels-readymade-3847457.jpg')] bg-cover bg-center p-10 text-[#f7efe4] lg:flex lg:flex-col lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#d7b68b]">
                  Studio Haritham
                </p>
                <h1 className="mt-6 max-w-md font-display text-5xl uppercase leading-[0.95] tracking-normal">
                  Clay, craft, and quiet rituals.
                </h1>
                <p className="mt-6 max-w-sm text-sm leading-7 text-[#ead7c3]">
                  Sign in to save favorites, manage orders, and keep your pottery journey close.
                </p>
              </div>
              <p className="text-xs leading-6 text-[#d8c2aa]">
                Your session is securely managed by Supabase Auth and restored automatically on return.
              </p>
            </div>

            <div className="p-6 sm:p-10 lg:p-12">
              <div className="mx-auto max-w-md">
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8a7765]">
                  {eyebrow}
                </p>
                <h2 className="mt-4 font-display text-4xl uppercase leading-none tracking-normal text-[#1b1511]">
                  {title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#665b4f]">{description}</p>
                {children}
                <p className="mt-7 text-center text-sm text-[#665b4f]">
                  {footerText}{" "}
                  <Link href={footerHref} className="font-semibold text-[#1b1511] underline-offset-4 hover:underline">
                    {footerLabel}
                  </Link>
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
