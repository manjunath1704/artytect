import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

import ClassCard from "@/app/components/cards/class-card";
import Footer from "@/app/components/home/footer";
import Navbar from "@/app/components/home/navbar";
import { potteryClasses } from "@/lib/classes";

export default function ClassesPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#fbf8f4] text-[#171717]">
        <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-[#201914] text-white">
          <Image
            src="/images/gallery/pexels-rdne-8903259.jpg"
            alt="Hands shaping clay in a pottery class"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(24,18,14,0.82),rgba(24,18,14,0.45),rgba(24,18,14,0.18))]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#fbf8f4] to-transparent" />

          <div className="site-container relative flex min-h-[calc(100vh-5rem)] items-end pb-12 pt-20 md:pb-16">
            <div className="grid w-full gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
              <div className="max-w-3xl">
                <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#e9d8c4]">
                  <Sparkles className="h-4 w-4" />
                  Pottery classes
                </p>
                <h1 className="mt-5 text-4xl font-display uppercase leading-[1] tracking-normal sm:text-7xl lg:text-8xl">
                  Make with clay, leave with ritual
                </h1>
                <p className="mt-7 max-w-xl text-sm leading-7 text-[#f4e9dc] md:text-base md:leading-8">
                  Small-format studio sessions for wheel throwing, handbuilding,
                  glazing, and the slow confidence that comes from making by hand.
                </p>
              </div>

              <div className="border border-white/18 bg-[#17110d]/55 p-5 backdrop-blur-md">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-display">{potteryClasses.length}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#e6d3c1]">
                      Classes
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-display">12</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#e6d3c1]">
                      Max seats
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-display">1-4</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#e6d3c1]">
                      Weeks
                    </p>
                  </div>
                </div>
                <Link
                  href="#classes"
                  className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 bg-white px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1b1511] transition hover:bg-[#ead7c3]"
                >
                  View classes
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="classes" className="py-14 md:py-20">
          <div className="site-container">
            <div className="mb-10 grid gap-6 border-b border-[#d7cabd] pb-7 md:grid-cols-[0.8fr_1fr] md:items-end">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9a6b4e]">
                  Studio calendar
                </p>
                <h2 className="mt-3 text-4xl font-display uppercase leading-none tracking-normal md:text-5xl">
                  Choose your table
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-[#6f6259] md:justify-self-end">
                Each class is capped for close instruction, enough room to make
                mistakes, and plenty of time to understand the material.
              </p>
            </div>

            <div className="grid gap-7 lg:grid-cols-3">
              {potteryClasses.map((classItem, index) => (
                <ClassCard
                  key={classItem.slug}
                  classItem={classItem}
                  index={index + 1}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
