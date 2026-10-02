"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Idle drift for hero cards: y -6/6, 6s, infinite, offset by delay so the
 * pair never moves in lockstep. Under prefers-reduced-motion it renders a
 * plain div.
 */
export function FloatCard({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      animate={{ y: [-6, 6, -6] }}
      transition={{ duration: 6, delay, ease: "easeInOut", repeat: Infinity }}
    >
      {children}
    </motion.div>
  );
}