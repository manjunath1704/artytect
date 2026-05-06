const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "/#collections" },
  { label: "About", href: "/#about" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Shop", href: "/products" },
  { label: "Contact", href: "/#contact" },
];

export default function Footer() {
  return (
    <footer id="contact" className="bg-black py-14 text-white">
      <div className="site-container">
        <div className="grid gap-10 border-b border-white/15 pb-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <a
              href="/"
              className="font-display text-3xl font-bold tracking-[0.22em] text-white"
            >
              ArtyTect
            </a>
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
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-white/75 transition hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="grid content-start gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-white/45">
              Contact
            </h3>
            <a
              href="mailto:hello@artytect.com"
              className="text-sm text-white/75 transition hover:text-white"
            >
              hello@artytect.com
            </a>
            <p className="text-sm text-white/75">Bengaluru, India</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ArtyTect. All rights reserved.</p>
          <p>Earthware for quiet daily living.</p>
        </div>
      </div>
    </footer>
  );
}
