"use client";

import { motion } from "motion/react";
import { useTheme } from "./ThemeProvider";

/** Sun/moon toggle with a rotating icon swap. */
export default function ThemeToggle({ dark = false }: { dark?: boolean }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`grid h-9 w-9 place-items-center rounded-full border transition-colors ${
        dark
          ? "border-night-line text-white/70 hover:border-white/40 hover:text-white"
          : "border-hairline text-ink-secondary hover:border-primary/40 hover:text-primary"
      }`}
    >
      <motion.span
        key={isDark ? "moon" : "sun"}
        initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="text-[15px] leading-none"
      >
        {isDark ? "☾" : "☀"}
      </motion.span>
    </button>
  );
}
