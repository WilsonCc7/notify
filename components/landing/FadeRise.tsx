"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Entry motion for landing cards: fade + 8px rise, 180ms, once.
 * Under prefers-reduced-motion it is a plain fade, no travel.
 */
export function FadeRise({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}