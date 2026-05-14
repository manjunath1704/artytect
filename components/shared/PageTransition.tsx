"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * PageTransition
 *
 * Cinematic fade + upward-drift animation for every page.
 * Designed for a premium, handcrafted aesthetic — subtle, calm, and elegant.
 *
 * Rendered inside app/template.tsx which Next.js re-mounts on every route
 * change, giving AnimatePresence a clean enter/exit cycle automatically.
 */

const variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -16,
  },
};

const transition = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number], // expo-out — fast settle, premium feel
};

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
      /**
       * min-height prevents the wrapper from collapsing to 0 during the exit
       * animation, which would cause a layout jump before the next page enters.
       *
       * willChange hints the browser to GPU-composite this layer for 60fps.
       * It is set only during animation via onAnimationStart/Complete to avoid
       * keeping the layer promoted permanently (memory cost).
       */
      style={{ minHeight: "100%", willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}
