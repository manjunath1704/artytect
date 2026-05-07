import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";

import Footer from "@/app/components/home/footer";
import Navbar from "@/app/components/home/navbar";

const contactMethods = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@artytect.com",
    href: "mailto:hello@artytect.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+91 98765 43210",
    href: "tel:+919876543210",
  },
  {
    icon: MapPin,
    label: "Studio",
    value: "Bengaluru, India",
    href: "https://maps.google.com/?q=Bengaluru%2C%20India",
  },
];

export default function ContactPage() {
  return (
    <>
      <Navbar forceSolid />
      <main className="bg-[#fcfdfa] pt-20 text-[#1b1511]">
        <section className="border-b border-black/10 py-16 md:py-24">
          <div className="site-container grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end lg:gap-16">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.36em] text-[#8a7765]">
                Contact us
              </p>
              <h1 className="mt-5 text-5xl font-display uppercase leading-none tracking-[-0.06em] sm:text-7xl lg:text-8xl">
                Let&apos;s shape something thoughtful
              </h1>
              <p className="mt-6 max-w-md text-sm leading-7 text-[#665b4f]">
                Reach out for custom pottery, collection questions, collaborations,
                or studio visits. We usually reply within one business day.
              </p>
            </div>

            <div className="relative aspect-[1.35/1] overflow-hidden bg-[#e8dfd2]">
              <Image
                src="/images/gallery/pexels-mart-production-8217302.jpg"
                alt="Ceramic studio table with handmade pieces"
                fill
                priority
                sizes="(min-width: 1024px) 58vw, calc(100vw - 48px)"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20">
          <div className="site-container grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <aside>
              <h2 className="text-3xl font-display tracking-[-0.04em] md:text-4xl">
                Studio details
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-7 text-[#665b4f]">
                For urgent order changes, email us with your order number in the
                subject line.
              </p>

              <div className="mt-8 grid gap-4">
                {contactMethods.map((method) => {
                  const Icon = method.icon;

                  return (
                    <a
                      key={method.label}
                      href={method.href}
                      className="group flex items-center gap-4 border border-[#e1d7cb] bg-white p-4 transition hover:border-[#1b1511]"
                      target={method.label === "Studio" ? "_blank" : undefined}
                      rel={method.label === "Studio" ? "noreferrer" : undefined}
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#f4eadf] text-[#1b1511]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a7765]">
                          {method.label}
                        </span>
                        <span className="mt-1 block text-sm text-[#1b1511] transition group-hover:opacity-70">
                          {method.value}
                        </span>
                      </span>
                    </a>
                  );
                })}
              </div>
            </aside>

            <form className="border border-[#e1d7cb] bg-white p-5 md:p-8">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a7765]">
                    Name
                  </span>
                  <input
                    type="text"
                    name="name"
                    required
                    className="h-12 w-full border border-black/10 bg-[#fcfdfa] px-4 text-sm outline-none transition focus:border-[#1b1511]"
                    placeholder="Your name"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a7765]">
                    Email
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    className="h-12 w-full border border-black/10 bg-[#fcfdfa] px-4 text-sm outline-none transition focus:border-[#1b1511]"
                    placeholder="you@example.com"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a7765]">
                    Mobile number
                  </span>
                  <input
                    type="tel"
                    name="mobile"
                    required
                    inputMode="tel"
                    className="h-12 w-full border border-black/10 bg-[#fcfdfa] px-4 text-sm outline-none transition focus:border-[#1b1511]"
                    placeholder="+91 98765 43210"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a7765]">
                    Topic
                  </span>
                  <select
                    name="topic"
                    className="h-12 w-full border border-black/10 bg-[#fcfdfa] px-4 text-sm outline-none transition focus:border-[#1b1511]"
                    defaultValue="Custom order"
                  >
                    <option>Custom order</option>
                    <option>Product question</option>
                    <option>Collaboration</option>
                    <option>Studio visit</option>
                  </select>
                </label>
              </div>

              <label className="mt-5 block">
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a7765]">
                  Message
                </span>
                <textarea
                  name="message"
                  required
                  rows={7}
                  className="w-full resize-y border border-black/10 bg-[#fcfdfa] px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#1b1511]"
                  placeholder="Tell us what you are looking for."
                />
              </label>

              <button
                type="submit"
                className="mt-6 h-12 bg-[#1b1511] px-8 text-[11px] font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-[#3a2f27]"
              >
                Send inquiry
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
