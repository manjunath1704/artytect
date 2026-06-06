"use client";

import { motion } from "framer-motion";

export default function FAQSectionSkeleton() {
  return (
    <section className="bg-[#fffdf9] px-6 py-20 sm:px-8 md:py-28 lg:px-10">
      <div className="mx-auto max-w-2xl">
        {/* Header skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <div className="mx-auto h-3 w-20 rounded-full bg-gradient-to-r from-[#e8ddd1] to-[#d9ccbc] animate-pulse" />
          <div className="mx-auto mt-4 h-10 w-48 rounded-full bg-gradient-to-r from-[#e8ddd1] to-[#d9ccbc] animate-pulse" />
          <div className="mx-auto mt-4 h-4 w-64 rounded-full bg-gradient-to-r from-[#e8ddd1] to-[#d9ccbc] animate-pulse" />
        </motion.div>

        {/* FAQs skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-3"
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="h-14 rounded-[32px] border border-[#e4d9d0] bg-gradient-to-r from-[#f9f7f3] to-[#fcfaf7] animate-pulse" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
