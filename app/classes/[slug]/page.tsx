import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Clock, Users } from "lucide-react";
import { notFound } from "next/navigation";

import Footer from "@/app/components/home/footer";
import Navbar from "@/app/components/home/navbar";
import WhatsAppButton from "@/components/whatsapp-button";
import { getClass, potteryClasses } from "@/lib/classes";
import { formatPrice, getClassBookingMessage } from "@/lib/whatsapp";

type ClassPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return potteryClasses.map((classItem) => ({
    slug: classItem.slug,
  }));
}

export default async function ClassPage({ params }: ClassPageProps) {
  const { slug } = await params;
  const classItem = getClass(slug);

  if (!classItem) {
    notFound();
  }

  const relatedClasses = potteryClasses.filter((item) => item.slug !== classItem.slug);

  return (
    <>
      <Navbar forceSolid />
      <main className="bg-white pt-20 text-[#171717]">
        <section className="py-12 md:py-16 lg:py-20">
          <div className="site-container">
            <Link
              href="/classes"
              className="mb-8 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7d746d] transition hover:text-[#1b1511]"
            >
              <ArrowLeft className="h-4 w-4" />
              Classes
            </Link>

            <div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 xl:gap-20">
              <div className="relative aspect-[1.08/1] overflow-hidden bg-[#f1ece6]">
                <Image
                  src={classItem.image}
                  alt={classItem.title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, calc(100vw - 48px)"
                  className="object-cover"
                />
              </div>

              <div className="lg:sticky lg:top-28 lg:self-start">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9a8d82]">
                  {classItem.level}
                </p>
                <h1 className="mt-3 text-4xl font-semibold uppercase tracking-[0.03em] sm:text-5xl">
                  {classItem.title}
                </h1>
                <p className="mt-4 text-lg text-[#9a8d82]">
                  {formatPrice(classItem.price)}
                </p>

                <div className="mt-7 flex flex-wrap gap-3 text-sm text-[#6f6259]">
                  <span className="inline-flex items-center gap-2 border border-black/10 px-4 py-3">
                    <Clock className="h-4 w-4" />
                    {classItem.duration}
                  </span>
                  <span className="inline-flex items-center gap-2 border border-black/10 px-4 py-3">
                    <Users className="h-4 w-4" />
                    {classItem.capacity}
                  </span>
                </div>

                <p className="mt-9 max-w-xl text-sm leading-7 text-[#7d746d]">
                  {classItem.description}
                </p>

                <div className="mt-8 border border-black/10 bg-[#fcfaf7] p-5">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.2em]">
                    Included
                  </h2>
                  <ul className="mt-4 grid gap-3 text-sm text-[#6f6259]">
                    {classItem.includes.map((item) => (
                      <li key={item} className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-[#8a5f3b]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <WhatsAppButton
                  message={getClassBookingMessage(classItem)}
                  className="mt-8 hidden h-14 w-full md:inline-flex"
                >
                  Book via WhatsApp
                </WhatsAppButton>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-black/10 py-16 md:py-24">
          <div className="site-container">
            <h2 className="text-xl font-semibold uppercase tracking-[0.08em]">
              More classes
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {relatedClasses.map((relatedClass) => (
                <Link
                  key={relatedClass.slug}
                  href={`/classes/${relatedClass.slug}`}
                  className="group grid gap-5 border border-black/10 p-4 transition hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(27,21,17,0.08)] sm:grid-cols-[150px_1fr]"
                >
                  <div className="relative aspect-square overflow-hidden bg-[#f1ece6]">
                    <Image
                      src={relatedClass.image}
                      alt={relatedClass.title}
                      fill
                      sizes="150px"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a8d82]">
                      {relatedClass.duration}
                    </p>
                    <h3 className="mt-3 text-sm font-semibold uppercase tracking-[0.12em]">
                      {relatedClass.title}
                    </h3>
                    <p className="mt-3 text-sm text-[#9a8d82]">
                      {formatPrice(relatedClass.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-4 bottom-4 z-[70] md:hidden">
        <WhatsAppButton message={getClassBookingMessage(classItem)} className="h-14 w-full">
          Book via WhatsApp
        </WhatsAppButton>
      </div>
      <Footer />
    </>
  );
}
