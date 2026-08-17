"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import FadeIn from "@/components/ui/FadeIn";
import BlurText from "@/components/reactbits/TextAnimations/BlurText/BlurText";

function Tilt({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(my, [0, 1], [6, -6]), {
    stiffness: 140,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-7, 7]), {
    stiffness: 140,
    damping: 20,
  });

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
      onMouseLeave={() => {
        mx.set(0.5);
        my.set(0.5);
      }}
      className="[perspective:1200px]"
    >
      {children}
    </motion.div>
  );
}

const referrals = [
  { name: "Rahul S.", project: "E-commerce store", pts: "+2,400", status: "Paid" },
  { name: "Priya M.", project: "College fest website", pts: "+1,600", status: "Paid" },
  { name: "Amit K.", project: "WhatsApp bot", pts: "+2,000", status: "Pending" },
  { name: "Sneha R.", project: "Portfolio site", pts: "+800", status: "Paid" },
];

export default function DashboardPreview() {
  return (
    <section className="relative overflow-hidden bg-night py-24 md:py-32">
      <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent)]" />
      <div className="noise absolute inset-0" />

      <div className="relative mx-auto max-w-6xl px-5">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-primary-soft">
            Your dashboard
          </p>
          <BlurText
            text="Everything you referred, one clean view"
            animateBy="words"
            delay={60}
            threshold={0.2}
            tag="h2"
            className="display mt-3 text-4xl text-white md:text-5xl"
          />
          <p className="mt-4 text-base leading-relaxed text-white/55">
            Watch points accumulate the moment a payment lands, and request a
            withdrawal straight from your balance card.
          </p>
        </FadeIn>

        <FadeIn delay={0.15} className="mx-auto mt-16 max-w-4xl">
          <Tilt>
            <div className="overflow-hidden rounded-2xl border border-night-line bg-night-soft shadow-[0_40px_120px_rgba(0,0,0,0.55)]">
              {/* Window chrome */}
              <div className="flex items-center gap-2 border-b border-night-line px-5 py-3.5">
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="ml-3 font-mono text-[12px] text-white/35">
                  app.lakshyareferrals.in/dashboard
                </span>
              </div>

              <div className="grid md:grid-cols-[190px_1fr]">
                {/* Sidebar */}
                <aside className="hidden border-r border-night-line p-5 md:block">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-white/30">
                    Lakshya Referrals
                  </p>
                  <nav className="mt-6 space-y-1 text-[13.5px]">
                    {["Overview", "My referrals", "Points ledger", "Withdraw"].map(
                      (item, i) => (
                        <div
                          key={item}
                          className={`rounded-lg px-3 py-2 ${
                            i === 1
                              ? "bg-primary/20 text-white"
                              : "text-white/50"
                          }`}
                        >
                          {item}
                        </div>
                      )
                    )}
                  </nav>
                  <div className="mt-10 rounded-xl border border-night-line bg-night p-4">
                    <p className="text-[11px] uppercase tracking-wider text-white/35">
                      Balance
                    </p>
                    <p className="tabular mt-1 text-2xl font-medium text-white">
                      ₹1,700
                    </p>
                    <p className="tabular mt-0.5 font-mono text-[11px] text-mint">
                      6,800 pts
                    </p>
                    <button className="mt-3 w-full rounded-lg bg-primary py-2 text-[12.5px] font-medium text-white">
                      Withdraw
                    </button>
                  </div>
                </aside>

                {/* Main */}
                <div className="p-5 md:p-7">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[15px] font-medium text-white">
                      My referrals
                    </h3>
                    <span className="rounded-full bg-mint/10 px-2.5 py-1 font-mono text-[11px] text-mint">
                      4 active
                    </span>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-xl border border-night-line">
                    {referrals.map((r, i) => (
                      <div
                        key={r.name}
                        className={`flex items-center gap-4 px-4 py-3.5 text-[13.5px] ${
                          i > 0 ? "border-t border-night-line" : ""
                        }`}
                      >
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-magenta text-[11px] font-medium text-white">
                          {r.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-white/90">
                            {r.name}
                          </p>
                          <p className="truncate text-[12px] text-white/40">
                            {r.project}
                          </p>
                        </div>
                        <span className="tabular hidden font-mono text-[12.5px] text-mint sm:block">
                          {r.pts}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                            r.status === "Paid"
                              ? "bg-mint/10 text-mint"
                              : "bg-amber-400/10 text-amber-300"
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-4 text-[12px] text-white/40">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-mint" /> Paid
                      to your bank
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                      Pending 24h payout
                    </span>
                    <span className="ml-auto font-mono">
                      updated just now
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Tilt>
        </FadeIn>
      </div>
    </section>
  );
}
