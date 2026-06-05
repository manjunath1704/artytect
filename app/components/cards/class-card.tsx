"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, Users } from "lucide-react";

import { AddClassToCart } from "@/components/cart/add-class-to-cart";
import type { PotteryClass } from "@/lib/classes";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/whatsapp";

type ClassCardProps = {
  classItem: PotteryClass;
  className?: string;
  imageSizes?: string;
};

export default function ClassCard({
  classItem,
  className,
  imageSizes = "(min-width: 768px) 31vw, calc(100vw - 48px)",
}: ClassCardProps) {
  const capacity = `${classItem.total_seats} seats`;
  
  return (
    <article
      className={cn(
        "group overflow-hidden rounded-[32px] shadow-sm bg-[#fffdf9] shadow-sm transition-shadow duration-300",
        className,
      )}
    >
      <Link href={`/classes/${classItem.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#e8ded3]">
          <Image
            src={classItem.thumbnail_url}
            alt={classItem.title}
            fill
            sizes={imageSizes}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,17,13,0.18),rgba(23,17,13,0.2)_34%,rgba(23,17,13,0.9))]" />
          
          <div className="absolute inset-x-2 bottom-2 rounded-2xl bg-[#17110d]/62 p-2 text-white backdrop-blur-[2px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#ead7c3]">
              {classItem.level}
            </p>
            <h3 className="mt-2 text-2xl font-display  leading-1 tracking-normal">
              {classItem.title}
            </h3>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <div className="grid grid-cols-3 rounded-2xl shadow-md bg-[#faf7f4] py-2 text-center text-[#5d5148]">
          <div className="border-r border-[#e2d6ca] px-2">
            <Clock className="mx-auto h-4 w-4 text-[#9a6b4e]" />
            <p className="mt-1.5 text-xs">{classItem.duration}</p>
          </div>
          <div className="border-r border-[#e2d6ca] px-2">
            <Users className="mx-auto h-4 w-4 text-[#9a6b4e]" />
            <p className="mt-1.5 text-xs">{capacity}</p>
          </div>
          <div className="px-2">
            <p className="text-base font-semibold text-[#1b1511]">
              {formatPrice(classItem.price)}
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em]">
              Fee
            </p>
          </div>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#7d746d]">
          {classItem.short_description}
        </p>

        <div className="mt-3 grid grid-cols-[1fr_auto] gap-3">
          <AddClassToCart classData={classItem} />
          <Link
            href={`/classes/${classItem.slug}`}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#d8cec1] px-4 text-[11px] font-semibold uppercase tracking-[0.16em] transition hover:border-[#1b1511] hover:bg-white"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
