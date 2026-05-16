import Image from "next/image";
import Link from "next/link";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Categories", href: "/categories" },
  { label: "Products", href: "/products" },
  { label: "Classes", href: "/classes" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer id="contact" className="bg-black py-14 text-white">
      <div className="site-container">
        <div className="grid gap-10 border-b border-white/15 pb-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
             <Link href="/" className="relative inline-block h-12 w-60 transition-opacity hover:opacity-80 sm:h-14 sm:w-60">
          <Image
            src="/logo/logo-light.svg"
            alt="Haritham"
            fill
            className="object-contain object-left"
            
          />
        </Link>

            <p className="mt-5 max-w-md text-base leading-7 text-white/65">
              Handcrafted ceramics shaped with calm forms, natural texture, and
              a quiet respect for everyday rituals.
            </p>
          </div>

          <nav className="grid content-start gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-white/45">
              Explore
            </h3>
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-white/75 transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="grid content-start gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-white/45">
              Contact
            </h3>
            <a
              href="mailto:hello@haritham.com"
              className="text-sm text-white/75 transition hover:text-white"
            >
              hello@haritham.com
            </a>
            <p className="text-sm text-white/75">Bengaluru, India</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Haritham. All rights reserved.</p>
          <p>Earthware for quiet daily living.</p>
        </div>
      </div>
    </footer>
  );
}
