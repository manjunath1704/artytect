import Link from "next/link";
import { ArrowRight } from "lucide-react";

type ViewMoreLinkProps = {
  href: string;
  children: string;
};

export default function ViewMoreLink({ href, children }: ViewMoreLinkProps) {
  return (
    <Link
      href={href}
      className="group inline-flex h-12 items-center justify-center gap-3 border border-[#1b1511] bg-[#1b1511] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_16px_32px_rgba(27,21,17,0.12)] transition hover:-translate-y-0.5 hover:bg-transparent hover:text-[#1b1511] sm:px-6"
    >
      <span>{children}</span>
      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
    </Link>
  );
}
