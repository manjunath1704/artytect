import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check, Clock, Sparkles, Users } from "lucide-react";
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
      <Navbar />
      <main className="bg-[#fbf8f4] text-[#171717]">
        <section className="relative overflow-hidden border-b border-[#ded2c6] bg-[#211914] text-white">
          <div className="absolute inset-0">
            <Image
              src={classItem.image}
              alt={classItem.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(27,21,17,0.88),rgba(27,21,17,0.58),rgba(27,21,17,0.22))]" />
          </div>

          <div className="site-container relative flex min-h-[580px] items-end py-12 md:py-16">
            <div className="max-w-4xl">
              {/* <Link
                href="/classes"
                className="mb-8 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ead7c3] transition hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Classes
              </Link> */}
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ead7c3]">
                {classItem.level}
              </p>
              <h1 className="mt-4 text-4xl font-display uppercase leading-[1] tracking-normal sm:text-5xl lg:text-6xl">
                {classItem.title}
              </h1>
              <p className="mt-7 max-w-2xl text-sm leading-7 text-[#f2e3d5] md:text-base md:leading-8">
                {classItem.shortDescription}
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 lg:py-20">
          <div className="site-container">
            <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start xl:gap-16">
              <div>
                <div className="grid border border-[#d8cec1] shadow-md rounded-[32px] text-center grid-cols-3">
                  <div className=" border-[#d8cec1] px-5 py-6 sm:border-b-0 sm:border-r">
                    <Clock className="mx-auto h-5 w-5 text-[#9a6b4e]" />
                    <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a7765]">
                      Duration
                    </p>
                    <p className="mt-2 text-sm font-semibold">{classItem.duration}</p>
                  </div>
                  <div className=" border-[#d8cec1] px-5 py-6 sm:border-b-0 sm:border-r">
                    <Users className="mx-auto h-5 w-5 text-[#9a6b4e]" />
                    <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a7765]">
                      Capacity
                    </p>
                    <p className="mt-2 text-sm font-semibold">{classItem.capacity}</p>
                  </div>
                  <div className="px-5 py-6">
                    <p className="text-2xl font-display text-[#1b1511]">
                      {formatPrice(classItem.price)}
                    </p>
                    <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a7765]">
                      Class fee
                    </p>
                  </div>
                </div>

                <div className="mt-12 grid gap-10 md:grid-cols-[0.72fr_1fr]">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9a6b4e]">
                      Class overview
                    </p>
                    <h2 className="mt-3 text-4xl font-display uppercase leading-none tracking-normal">
                      What you will shape
                    </h2>
                  </div>
                  <div className="space-y-7">
                    <p className="text-sm leading-8 text-[#6f6259]">
                      {classItem.description}
                    </p>
                    <p className="text-sm leading-8 text-[#6f6259]">
                      Sessions are paced for hands-on practice, individual guidance,
                      and enough quiet repetition to make the material feel familiar.
                    </p>
                  </div>
                </div>

                <div className="mt-12 rounded-[32px] shadow-sm bg-[#fffdf9] p-6 md:p-8">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.2em]">
                    Included in your seat
                  </h2>
                  <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                    {classItem.includes.map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm text-[#5f544b]">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ead7c3] text-[#5b3826]">
                          <Check className="h-4 w-4" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-12 grid gap-4 sm:grid-cols-3">
                  {["Arrive curious", "Practice slowly", "Finish fired"].map((step, index) => (
                    <div key={step} className="border-t border-[#d8cec1] pt-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9a6b4e]">
                        Step 0{index + 1}
                      </p>
                      <p className="mt-3 text-lg font-display uppercase tracking-normal">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="lg:sticky lg:top-28">
                <div className="overflow-hidden rounded-[32px] shadow-md bg-[#fffdf9]">
                  <div className="relative aspect-[1.2/1] bg-[#e8ded3]">
                    <Image
                      src={classItem.image}
                      alt={`${classItem.title} studio detail`}
                      fill
                      sizes="380px"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9a6b4e]">
                      Reserve your seat
                    </p>
                    <h2 className="mt-3 text-3xl font-display uppercase leading-none tracking-normal">
                      {classItem.title}
                    </h2>
                    <div className="mt-5 flex items-center justify-between border-y border-[#e2d6ca] py-4 text-sm">
                      <span className="text-[#6f6259]">Class fee</span>
                      <span className="font-semibold">{formatPrice(classItem.price)}</span>
                    </div>
                    <p className="mt-5 text-sm leading-7 text-[#6f6259]">
                      Tap to start a WhatsApp booking with the class name, fee, and
                      duration already filled in.
                    </p>
                    <WhatsAppButton
                      message={getClassBookingMessage(classItem)}
                      className="mt-6  h-14 w-full inline-flex"
                    >
                      Book via WhatsApp
                    </WhatsAppButton>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="border-t border-[#d8cec1] bg-[#f4eee7] py-16 md:py-24">
          <div className="site-container">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9a6b4e]">
                  Keep exploring
                </p>
                <h2 className="mt-3 text-4xl font-display uppercase leading-none tracking-normal">
                  More classes
                </h2>
              </div>
              <Link
                href="/classes"
                className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition hover:text-[#8a5f3b]"
              >
                View all
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {relatedClasses.map((relatedClass) => (
                <Link
                  key={relatedClass.slug}
                  href={`/classes/${relatedClass.slug}`}
                  className="group grid gap-5 shadow-sm rounded-[32px] bg-[#fffdf9] p-4 sm:grid-cols-[150px_1fr]"
                >
                  <div className="relative aspect-square rounded-[32px] overflow-hidden bg-[#f1ece6]">
                    <Image
                      src={relatedClass.image}
                      alt={relatedClass.title}
                      fill
                      sizes="150px"
                      className="object-cover "
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a6b4e]">
                      {relatedClass.duration}
                    </p>
                    <h3 className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] transition group-hover:text-[#8a5f3b]">
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

      <div className=" sticky bottom-[5.5rem] z-[70] md:hidden px-5">
        <WhatsAppButton message={getClassBookingMessage(classItem)} className="h-14 w-full">
          Book via WhatsApp
        </WhatsAppButton>
      </div>
      <Footer />
    </>
  );
}
