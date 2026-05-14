import Image from "next/image";
import Link from "next/link";
import { Clock, Users } from "lucide-react";

import Footer from "@/app/components/home/footer";
import Navbar from "@/app/components/home/navbar";
import WhatsAppButton from "@/components/whatsapp-button";
import { potteryClasses } from "@/lib/classes";
import { formatPrice, getClassBookingMessage } from "@/lib/whatsapp";

export default function ClassesPage() {
  return (
    <>
      <Navbar forceSolid />
      <main className="bg-white pt-20 text-[#171717]">
        <section className="border-b border-black/10 bg-[#f8f3ee]">
          <div className="site-container grid min-h-[500px] gap-10 py-16 md:grid-cols-[0.9fr_1.1fr] md:items-center md:py-20">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.36em] text-[#9a6b4e]">
                Pottery classes
              </p>
              <h1 className="mt-5 text-5xl font-display uppercase leading-none tracking-[-0.05em] sm:text-7xl">
                Learn clay with quiet focus
              </h1>
              <p className="mt-6 max-w-md text-sm leading-7 text-[#6f6259]">
                Small-batch studio sessions for wheel throwing, handbuilding,
                surface work, and the rituals that make clay feel approachable.
              </p>
            </div>

            <div className="relative aspect-[1.2/1] min-h-[320px] overflow-hidden bg-[#efe5dc]">
              <Image
                src="/images/gallery/pexels-rdne-8903259.jpg"
                alt="Hands shaping clay in a pottery class"
                fill
                priority
                sizes="(min-width: 768px) 56vw, calc(100vw - 48px)"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20">
          <div className="site-container">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-black/10 pb-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9a8d82]">
                  Studio calendar
                </p>
                <h2 className="mt-2 text-sm font-semibold uppercase tracking-[0.24em]">
                  Available classes
                </h2>
              </div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#8a817a]">
                {potteryClasses.length} formats
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {potteryClasses.map((classItem) => (
                <article
                  key={classItem.slug}
                  className="group overflow-hidden border border-black/10 bg-white shadow-[0_18px_50px_rgba(27,21,17,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(27,21,17,0.12)]"
                >
                  <Link href={`/classes/${classItem.slug}`} className="block">
                    <div className="relative aspect-[1.05/1] overflow-hidden bg-[#f1ece6]">
                      <Image
                        src={classItem.image}
                        alt={classItem.title}
                        fill
                        sizes="(min-width: 768px) 31vw, calc(100vw - 48px)"
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />
                    </div>
                  </Link>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a8d82]">
                        {classItem.level}
                      </p>
                      <p className="text-sm font-semibold text-[#1b1511]">
                        {formatPrice(classItem.price)}
                      </p>
                    </div>

                    <Link href={`/classes/${classItem.slug}`} className="block">
                      <h3 className="mt-3 text-base font-semibold uppercase tracking-[0.08em] transition group-hover:text-[#8a5f3b]">
                        {classItem.title}
                      </h3>
                    </Link>

                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#7d746d]">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {classItem.duration}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {classItem.capacity}
                      </span>
                    </div>

                    <p className="mt-4 min-h-[4.5rem] text-sm leading-7 text-[#7d746d]">
                      {classItem.shortDescription}
                    </p>

                    <div className="mt-5 grid grid-cols-[1fr_auto] gap-3">
                      <WhatsAppButton
                        message={getClassBookingMessage(classItem)}
                        className="h-11 px-4"
                      >
                        Book Now
                      </WhatsAppButton>
                      <Link
                        href={`/classes/${classItem.slug}`}
                        className="inline-flex h-11 items-center justify-center border border-black/10 px-4 text-[11px] font-semibold uppercase tracking-[0.16em] transition hover:border-[#1b1511]"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
