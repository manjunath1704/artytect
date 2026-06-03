"use client";

import Image from "next/image";
import Link from "next/link";

import WhatsAppButton from "@/components/whatsapp-button";
import type { PotteryClass } from "@/lib/classes";
import { cn } from "@/lib/utils";
import { getClassBookingMessage } from "@/lib/whatsapp";

type ClassCardMicroProps = {
  classItem: PotteryClass;
  index: number;
  className?: string;
  imageSizes?: string;
};

export default function ClassCardMicro({
  classItem,
  className,
  imageSizes = "(min-width: 768px) 31vw, calc(100vw - 48px)",
}: Omit<ClassCardMicroProps, 'index'>) {
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
            src={classItem.image}
            alt={classItem.title}
            fill
            sizes={imageSizes}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,17,13,0.18),rgba(23,17,13,0.2)_34%,rgba(23,17,13,0.9))]" />
          
          <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-[#17110d]/62  text-white backdrop-blur-[2px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#ead7c3]">
              {classItem.level}
            </p>
            <h3 className="mt-2 text-lg font-display uppercase leading-none tracking-normal">
              {classItem.title}
            </h3>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#7d746d]">
          {classItem.shortDescription}
        </p>

        <div className="mt-3 ">
          <WhatsAppButton
            message={getClassBookingMessage(classItem)}
            className="h-11 rounded-full px-4"
          >
            Book Now
          </WhatsAppButton>
          
        </div>
      </div>
    </article>
  );
}
