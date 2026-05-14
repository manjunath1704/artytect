"use client";

import { motion } from "framer-motion";
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
      className="group block h-full"
      // whileHover={{ y: -8, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      aria-label={`Shop ${title}`}
    >
      <article className="h-full overflow-hidden border border-[#d8cabd] bg-[#fffdf9]  transition duration-300">
        <div className="relative overflow-hidden">
          <div className="relative aspect-[0.96/1] overflow-hidden bg-[#eee6dc]">
            <Image
              
              src={hoverThumbnailSrc}
              alt={title}
              fill
              className="object-cover transition duration-700 ease-out group-hover:scale-105 group-hover:opacity-0"
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 88vw"
            />
            <Image
              src={thumbnailSrc}
              alt={`${title} hover preview`}
              fill
              className="object-cover opacity-0 transition duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 88vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,21,17,0.02),rgba(27,21,17,0.1)_45%,rgba(27,21,17,0.62))]" />
            <span className="absolute right-4 top-4 border border-white/35 bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
              0{index}
            </span>
            <div className="absolute inset-x-4 bottom-4 text-white">
              <h3 className="text-3xl font-display uppercase leading-none tracking-normal drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
                {title}
              </h3>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-sm leading-7 text-[#665b4f]">{description}</p>
          <span className="inline-flex border-b border-[#1b1511] pb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1b1511] transition group-hover:text-[#8a5f3b]">
            Shop {title.toLowerCase()}
          </span>
        </div>
      </article>
    </motion.a>
  );
};

export default CategoryCard;
