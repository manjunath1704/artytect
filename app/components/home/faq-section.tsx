"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import type { FAQ } from "@/lib/faqs";

type FAQSectionProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
};

export default function FAQSection({
  eyebrow = "Common Questions",
  title = "Frequently Asked Questions",
  description = "Find answers to common questions about our pottery, classes, and services.",
}: FAQSectionProps) {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await fetch("/api/faqs");
        if (response.ok) {
          const data = await response.json();
          setFaqs(data.faqs || []);
        }
      } catch (error) {
        console.error("Error fetching FAQs:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchFAQs();
  }, []);

  if (loading) {
    return (
      <section className="bg-[#fffdf9] px-6 py-20 sm:px-8 md:py-28 lg:px-10">
        <div className="mx-auto max-w-2xl">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex items-center gap-3 text-[#665b4f]">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading FAQs...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (faqs.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#fffdf9] px-6 py-20 sm:px-8 md:py-28 lg:px-10">
      <div className="mx-auto site-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.36em] text-[#8a7765]">
            {eyebrow}
          </p>
          <h2 className="mt-3 font-display text-4xl md:text-6xl uppercase tracking-[-0.04em] text-[#1b1511]">
            {title}
          </h2>
          {description && (
            <p className="mt-4 text-sm leading-7 text-[#665b4f]">{description}</p>
          )}
        </motion.div>

        {/* FAQs */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className=""
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <AccordionItem
                  value={faq.id}
                  className="border-0 rounded-[32px] shadow-md bg-white overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-5 hover:no-underline [&[data-state=open]>svg]:text-[#8a7765] text-left">
                    <span className=" text-[#1b1511] text-xl font-semibold ">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-5 pt-0 text-sm leading-7 text-[#665b4f]">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
