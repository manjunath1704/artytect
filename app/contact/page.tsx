import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import { notFound } from "next/navigation";

import Footer from "@/app/components/home/footer";
import Navbar from "@/app/components/home/navbar";
import { isPublicPageVisible } from "@/lib/public-page-visibility";
import ContactMap from "../components/contact-map";
import ContactForm from "./contact-form";

const contactMethods = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@Haritham.com",
    href: "mailto:hello@Haritham.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+91 98765 43210",
    href: "tel:+919876543210",
  },
  // {
  //   icon: MapPin,
  //   label: "Studio",
  //   value: "Bengaluru, India",
  //   href: "https://maps.google.com/?q=Bengaluru%2C%20India",
  // },
];

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  if (!(await isPublicPageVisible("contact"))) {
    notFound();
  }

  return (
    <>
      <Navbar transparentTone="dark" />
      <main className="relative overflow-hidden">
      {/* <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_10%,rgba(185,130,94,0.16),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(154,107,78,0.1),transparent_32%)]" />
      <div className="absolute inset-0 opacity-[0.05] [background-image:repeating-linear-gradient(0deg,rgba(27,21,17,0.28)_0px,rgba(27,21,17,0.28)_1px,transparent_1px,transparent_5px)]" /> */}

        <section className="border-b border-black/10 pb-16 pt-32 md:pb-24 md:pt-36">
          <div className="site-container grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end lg:gap-16">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.36em] text-[#8a7765]">
                Contact us
              </p>
              <h1 className="mt-5 text-4xl font-display uppercase sm:leading-[2] tracking-[0.06em] sm:5xl lg:text-6xl">
                Let&apos;s shape something thoughtful
              </h1>
              <p className="mt-6 max-w-md text-sm leading-7 text-[#665b4f]">
                Reach out for custom pottery, collection questions, collaborations,
                or studio visits. We usually reply within one business day.
              </p>
            </div>

            <div className="relative aspect-[1.35/1] overflow-hidden rounded-[32px] bg-[#e8dfd2]">
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
              <div className=" grid gap-4">
                {contactMethods.map((method) => {
                  const Icon = method.icon;

                  return (
                    <a
                      key={method.label}
                      href={method.href}
                      className="group flex items-center gap-4 overflow-hidden rounded-[32px] shadow-sm bg-white p-4 transition hover:border-[#1b1511]"
                      target={method.label === "Studio" ? "_blank" : undefined}
                      rel={method.label === "Studio" ? "noreferrer" : undefined}
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f4eadf] text-[#1b1511]">
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
                 <ContactMap/>
              </div>
            </aside>

            <ContactForm />
          </div>
        </section>
       
      </main>
      <Footer />
    </>
  );
}
