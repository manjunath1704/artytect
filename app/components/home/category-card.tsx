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
      <article className="h-full">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.65),transparent_36%)]" />
          <div className="absolute inset-x-6 bottom-4 h-8 bg-black/10 blur-2xl" />

          <div className="relative aspect-[4/3] overflow-hidden bg-white">
            <Image
              src={thumbnailSrc}
              alt={title}
              fill
              className="object-contain transition-opacity duration-500 ease-out group-hover:opacity-0"
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 88vw"
            />
            <Image
              src={hoverThumbnailSrc}
              alt={`${title} hover preview`}
              fill
              className="object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 88vw"
            />
          </div>
        </div>

        <div className="space-y-3 px-1 pt-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-2xl font-display tracking-[-0.03em] text-[#1b1511]">
              {title}
            </h3>
            <span className="text-xs uppercase tracking-[0.3em] text-[#8a7765]">
              0{index}
            </span>
          </div>
          <p className="text-sm leading-7 text-[#665b4f]">{description}</p>
          <span className="inline-flex items-center text-sm font-semibold text-[#1b1511] underline-offset-4 transition group-hover:underline">
            Shop {title.toLowerCase()}
          </span>
        </div>
      </article>
    </motion.a>
  );
};

export default CategoryCard;
