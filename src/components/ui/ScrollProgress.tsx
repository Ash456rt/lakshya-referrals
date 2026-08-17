"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Thin gradient bar tracking scroll position, pinned above the navbar. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-primary via-magenta to-primary"
      aria-hidden
    />
  );
}
