import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, Clock, Users, Calendar } from "lucide-react";
import { notFound } from "next/navigation";

import Footer from "@/app/components/home/footer";
import Navbar from "@/app/components/home/navbar";
import WhatsAppButton from "@/components/whatsapp-button";
import { AddClassToCart } from "@/components/cart/add-class-to-cart";
import { isPublicPageVisible } from "@/lib/public-page-visibility";
import { formatPrice } from "@/lib/whatsapp";
import type { PotteryClass } from "@/lib/classes";

type ClassPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

function getClassBookingMessage(classItem: PotteryClass): string {
  return `Hi! I'd like to book the *${classItem.title}* class.

*Duration:* ${classItem.duration}
*Date:* ${classItem.class_date}
*Time:* ${classItem.class_time}
*Fee:* ${formatPrice(classItem.price)}

Looking forward to learning!`;
}

async function getClassBySlug(slug: string): Promise<PotteryClass | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/classes/${slug}`,
      { cache: 'no-store' }
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.class;
  } catch (error) {
    console.error("Error fetching class:", error);
    return null;
  }
}

async function getAllClasses(): Promise<PotteryClass[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/classes`,
      { cache: 'no-store' }
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.classes || [];
  } catch (error) {
    console.error("Error fetching classes:", error);
    return [];
  }
}

export default async function ClassPage({ params }: ClassPageProps) {
  if (!(await isPublicPageVisible("classes"))) {
    notFound();
  }

  const { slug } = await params;
  const classItem = await getClassBySlug(slug);

  if (!classItem) {
    notFound();
  }

  const allClasses = await getAllClasses();
  const relatedClasses = allClasses.filter((item) => item.slug !== classItem.slug).slice(0, 2);

  return (
    <>
      <Navbar />
      <main className="bg-[#fbf8f4] text-[#171717]">
        <section className="relative overflow-hidden border-b border-[#ded2c6] bg-[#211914] text-white">
          <div className="absolute inset-0">
            <Image
              src={classItem.thumbnail_url}
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
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ead7c3]">
                {classItem.level}
              </p>
              <h1 className="mt-4 text-4xl font-display uppercase leading-[1] tracking-normal sm:text-5xl lg:text-6xl">
                {classItem.title}
              </h1>
              <p className="mt-7 max-w-2xl text-sm leading-7 text-[#f2e3d5] md:text-base md:leading-8">
                {classItem.short_description}
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 lg:py-20">
          <div className="site-container">
            <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start xl:gap-16">
              <div>
                <div className="grid border border-[#d8cec1] shadow-md rounded-[32px] text-center grid-cols-4">
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
                      Seats
                    </p>
                    <p className="mt-2 text-sm font-semibold">{classItem.available_seats}/{classItem.total_seats}</p>
                  </div>
                  <div className=" border-[#d8cec1] px-5 py-6 sm:border-b-0 sm:border-r">
                    <Calendar className="mx-auto h-5 w-5 text-[#9a6b4e]" />
                    <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a7765]">
                      Date
                    </p>
                    <p className="mt-2 text-sm font-semibold">{classItem.class_date}</p>
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
                  <div 
                    className="prose prose-sm max-w-none text-[#6f6259]"
                    dangerouslySetInnerHTML={{ __html: classItem.content }}
                  />
                </div>

                {classItem.instructor_name && (
                  <div className="mt-12 rounded-[32px] shadow-sm bg-[#fffdf9] p-6 md:p-8">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.2em]">
                      Your Instructor
                    </h2>
                    <p className="mt-4 text-lg font-semibold">{classItem.instructor_name}</p>
                  </div>
                )}

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
                      src={classItem.thumbnail_url}
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
                    <div className="mt-5 space-y-3 border-y border-[#e2d6ca] py-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[#6f6259]">Class fee</span>
                        <span className="font-semibold">{formatPrice(classItem.price)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#6f6259]">Available seats</span>
                        <span className="font-semibold">{classItem.available_seats} of {classItem.total_seats}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#6f6259]">Date & Time</span>
                        <span className="font-semibold">{classItem.class_date} at {classItem.class_time}</span>
                      </div>
                    </div>
                    <p className="mt-5 text-sm leading-7 text-[#6f6259]">
                      Select seats and add to your booking cart.
                    </p>
                    <div className="mt-6">
                      <AddClassToCart classData={classItem} />
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {relatedClasses.length > 0 && (
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
                    key={relatedClass.id}
                    href={`/classes/${relatedClass.slug}`}
                    className="group grid gap-5 shadow-sm rounded-[32px] bg-[#fffdf9] p-4 sm:grid-cols-[150px_1fr]"
                  >
                    <div className="relative aspect-square rounded-[32px] overflow-hidden bg-[#f1ece6]">
                      <Image
                        src={relatedClass.thumbnail_url}
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
        )}
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
