"use client";

import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

export type ProcessStep = {
  id: number | string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  sortOrder: number;
};

export type ProcessHeader = {
  eyebrow: string;
  title: string;
};

const fallbackHeader: ProcessHeader = {
  eyebrow: "The Process",
  title: "Crafting timeless ceramics with soul",
};

export default function CraftsmanshipProcess({
  header = fallbackHeader,
  steps,
}: {
  header?: ProcessHeader;
  steps: ProcessStep[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: stepsRef,
    offset: ["start 54%", "end 54%"],
  });

  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    stepRefs.current = stepRefs.current.slice(0, steps.length);
    setActiveIndex((currentIndex) => Math.min(currentIndex, Math.max(steps.length - 1, 0)));
  }, [steps.length]);

  useEffect(() => {
    let frame = 0;

    const updateActiveStep = () => {
      frame = 0;
      const readingLine = window.innerHeight * 0.54;
      const nextIndex = stepRefs.current.reduce((closestIndex, node, index) => {
        if (!node) return closestIndex;

        const closestNode = stepRefs.current[closestIndex];
        if (!closestNode) return index;

        const rect = node.getBoundingClientRect();
        const closestRect = closestNode.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - readingLine);
        const closestDistance = Math.abs(
          closestRect.top + closestRect.height / 2 - readingLine
        );

        return distance < closestDistance ? index : closestIndex;
      }, 0);

      setActiveIndex((currentIndex) =>
        currentIndex === nextIndex ? currentIndex : nextIndex
      );
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateActiveStep);
    };

    updateActiveStep();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  if (!steps.length) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="w-full bg-[#fcfdfa] text-[#1b1511] py-20 md:py-28"
    >
      <div className="site-container">
        <motion.div
          className="mb-10 md:mb-20 text-center"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7765]">
            {header.eyebrow}
          </p>
          <h2 className="text-4xl font-display leading-[0.98] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
            {header.title}
          </h2>
        </motion.div>

        <div className="grid gap-12 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] md:items-start md:gap-16 lg:gap-24">
          <div className="hidden md:sticky md:top-24 md:block md:h-[calc(100svh-8rem)] md:self-start">
            <div className="relative aspect-[4/5] overflow-hidden bg-[#e8dfd2] md:h-full md:aspect-auto rounded-[32px] shadow-sm">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  className="absolute inset-0"
                  animate={{
                    opacity: activeIndex === index ? 1 : 0,
                    scale: activeIndex === index ? 1 : 1.04,
                  }}
                  transition={{
                    opacity: { duration: 0.65, ease: "easeOut" },
                    scale: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
                  }}
                >
                  <Image
                    src={step.image}
                    alt={step.imageAlt}
                    fill
                    sizes="(min-width: 768px) 45vw, calc(100vw - 48px)"
                    priority={index === 0}
                    className="object-cover"
                  />
                </motion.div>
              ))}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,21,17,0.08),rgba(27,21,17,0.28))]" />
              <div className="absolute bottom-5 left-5 text-sm font-semibold uppercase tracking-[0.22em] text-white/90">
                0{activeIndex + 1} / 0{steps.length}
              </div>
            </div>
          </div>

          <div className="relative py-0 md:pb-[42svh] md:pt-10">
            <div className="absolute bottom-0 left-[15px] top-0 hidden w-px bg-[#d8cec1] md:block md:bottom-[42svh]" />
            <motion.div
              className="absolute bottom-0 left-[15px] top-0 hidden w-px origin-top bg-[#1b1511] md:block md:bottom-[42svh]"
              style={{ scaleY: lineScale }}
            />

            <div ref={stepsRef} className="flex flex-col gap-5 md:gap-24">
              {steps.map((step, index) => (
                <ProcessItem
                  key={step.id}
                  step={step}
                  index={index}
                  total={steps.length}
                  progress={scrollYProgress}
                  isActive={activeIndex === index}
                  stepRef={(node) => {
                    stepRefs.current[index] = node;
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProcessItem({
  step,
  index,
  total,
  progress,
  isActive,
  stepRef,
}: {
  step: ProcessStep;
  index: number;
  total: number;
  progress: MotionValue<number>;
  isActive: boolean;
  stepRef: (node: HTMLElement | null) => void;
}) {
  const denominator = Math.max(total - 1, 1);
  const center = index / denominator;
  const start = Math.max(0, center - 0.2);
  const end = Math.min(1, center + 0.2);
  const inputRange =
    index === 0
      ? [0, end]
      : index === total - 1
        ? [start, 1]
        : [start, center, end];
  const opacityOutput =
    index === 0
      ? [1, 0.42]
      : index === total - 1
        ? [0.42, 1]
        : [0.42, 1, 0.42];
  const yOutput =
    index === 0
      ? [0, 20]
      : index === total - 1
        ? [20, 0]
        : [20, 0, 20];
  const dotScaleOutput =
    index === 0
      ? [1.24, 0.82]
      : index === total - 1
        ? [0.82, 1.24]
        : [0.82, 1.24, 0.82];
  const opacity = useTransform(progress, inputRange, opacityOutput);
  const y = useTransform(progress, inputRange, yOutput);
  const dotScale = useTransform(progress, inputRange, dotScaleOutput);

  return (
    <motion.article
      ref={stepRef}
      className="relative overflow-hidden rounded-[32px] shadow-md bg-white md:overflow-visible md:rounded-none md:shadow-none md:bg-transparent md:pl-16"
      style={{ opacity, y }}
    >
      <div className="relative aspect-[1.18/1] bg-[#e8dfd2] md:hidden">
        <Image
          src={step.image}
          alt={step.imageAlt}
          fill
          sizes="calc(100vw - 48px)"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,21,17,0.02),rgba(27,21,17,0.22))]" />
        <div className="absolute bottom-4 left-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-white">
          0{index + 1} / 0{total}
        </div>
      </div>

      <motion.div
        className="absolute left-[9px] top-2 hidden h-3.5 w-3.5 border border-[#1b1511] bg-[#fcfdfa] md:block"
        style={{ scale: dotScale }}
        animate={{
          backgroundColor: isActive ? "#1b1511" : "#fcfdfa",
        }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      />

      <div className="p-5 md:p-0">
        <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8a7765] md:mb-4 md:text-xs md:tracking-[0.28em]">
          Step 0{index + 1}
        </span>
        <h3 className="mb-2 text-3xl font-display tracking-[-0.035em] text-[#1b1511] sm:text-4xl md:mb-3">
          {step.title}
        </h3>
        <p className="max-w-xl text-sm leading-7 text-[#665b4f] sm:text-base md:text-lg md:leading-8">
          {step.description}
        </p>
      </div>
    </motion.article>
  );
}
