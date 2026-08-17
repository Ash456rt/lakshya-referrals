"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Magnet from "@/components/reactbits/Animations/Magnet/Magnet";
import ThemeToggle from "@/components/theme/ThemeToggle";

const links = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#calculator", label: "Calculator" },
  { href: "#features", label: "Features" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar({ user }: { user?: { name: string; role: string } | null }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-canvas/80 backdrop-blur-xl border-b border-hairline"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-magenta text-white shadow-[0_4px_16px_rgba(83,58,253,0.35)]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 3v18M12 3l-6 6M12 3l6 6"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="text-[15px] font-medium tracking-tight text-ink">
            Lakshya{" "}
            <span className="font-semibold text-primary">Referrals</span>
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-ink-secondary transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <>
              <a
                href={user.role === "user" ? "/dashboard" : "/admin"}
                className="hidden text-sm font-medium text-ink-secondary transition-colors hover:text-ink sm:block"
              >
                {user.role === "user" ? "Dashboard" : "Admin"}
              </a>
              <Magnet padding={40} magnetStrength={1.6}>
                <a
                  href={user.role === "user" ? "/dashboard" : "/admin"}
                  className="rounded-full bg-primary px-4.5 py-2 text-sm font-medium text-white shadow-[0_2px_12px_rgba(83,58,253,0.35)] transition-colors hover:bg-primary-deep"
                >
                  {user.role === "user" ? "My dashboard" : "Admin panel"}
                </a>
              </Magnet>
            </>
          ) : (
            <>
              <a
                href="/login"
                className="hidden text-sm font-medium text-ink-secondary transition-colors hover:text-ink sm:block"
              >
                Sign in
              </a>
              <Magnet padding={40} magnetStrength={1.6}>
                <a
                  href="/signup"
                  className="rounded-full bg-primary px-4.5 py-2 text-sm font-medium text-white shadow-[0_2px_12px_rgba(83,58,253,0.35)] transition-colors hover:bg-primary-deep"
                >
                  Get your link
                </a>
              </Magnet>
            </>
          )}
        </div>
      </nav>
    </motion.header>
  );
}
