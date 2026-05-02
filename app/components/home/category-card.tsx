"use client";

import { motion } from "framer-motion";

type CategoryCardProps = {
  title: string;
  description: string;
 // accent: string;
  href: string;
  index: number;
};

const CategoryCard = ({ title, description, href, index }: CategoryCardProps) => {
  return (
    <motion.a
      href={href}
      className="group block h-full"
      whileHover={{ y: -8, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      aria-label={`Shop ${title}`}
    >
      <article className="h-full">
        <div className="relative overflow-hidden p-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.65),transparent_36%)]" />
          <div className="absolute inset-x-6 bottom-4 h-8 bg-black/10 blur-2xl" />

          <div className="relative flex aspect-[4/3] items-center justify-center">
            {/* <motion.div
              whileHover={{ rotate: 4, scale: 1.04 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              className={`h-28 w-28 bg-gradient-to-b ${accent} shadow-[0_20px_32px_rgba(23,20,15,0.16)]`}
            /> */}
            <div className="absolute inset-x-[24%] bottom-[18%] h-8 rounded-full bg-black/10 blur-lg" />
            <div className="absolute left-[18%] top-[24%] h-9 w-9 rounded-full bg-white/35 blur-[2px]" />
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
