"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

type CategoryCardProps = {
  title: string;
  description: string;
  href: string;
  index: number;
  thumbnailSrc: string;
  hoverThumbnailSrc: string;
};

const CategoryCard = ({
  title,
  description,
  href,
  index,
  thumbnailSrc,
  hoverThumbnailSrc,
}: CategoryCardProps) => {
  return (
    <motion.a
      href={href}
      className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9a6b4e]/40 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f6efe6]"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 240, damping: 24, delay: index * 0.04 }}
      aria-label={`Shop ${title}`}
    >
      <article className="relative h-full overflow-hidden rounded-[32px] border border-[#e1d1c3] bg-[#fffaf3] shadow-sm transition-shadow duration-300 hover:shadow-md">
        <div className="relative overflow-hidden p-3 pb-0">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-[#eee6dc]">
            <Image
              src={thumbnailSrc}
              alt={title}
              fill
              className="object-cover transition-opacity duration-500 ease-out group-hover:opacity-0"
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 88vw"
            />
            <Image
              src={hoverThumbnailSrc}
              alt={`${title} alternate view`}
              fill
              className="object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 88vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,21,17,0.04),rgba(27,21,17,0.12)_38%,rgba(27,21,17,0.78))]" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(circle_at_20%_100%,rgba(185,130,94,0.32),transparent_58%)]" />
            <span className="absolute left-4 top-4 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md">
              0{index}
            </span>
            <span className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-md">
              <ArrowUpRight className="h-4 w-4" />
            </span>
            <div className="absolute inset-x-5 bottom-5 text-white">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f1d8c2]">
                Explore collection
              </p>
              <h3 className="text-4xl font-display uppercase leading-none tracking-normal">
                {title}
              </h3>
            </div>
          </div>
        </div>

        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-4 border-b border-[#eadfd4] pb-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9a6b4e]">
              Handcrafted forms
            </p>
            <span className="h-px flex-1 bg-[#eadfd4]" />
          </div>
          <p className="line-clamp-2 text-sm leading-6 text-[#665b4f]">
            {description}
          </p>
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1b1511]">
            Shop {title.toLowerCase()}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </article>
    </motion.a>
  );
};

export default CategoryCard;
