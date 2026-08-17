"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import FadeIn from "@/components/ui/FadeIn";
import BlurText from "@/components/reactbits/TextAnimations/BlurText/BlurText";

const MIN = 2000;
const MAX = 50000;
const STEP = 500;
const PTS_PER_RS = 4;
const MIN_WITHDRAW_PTS = 2000;

function inr(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

export default function Calculator() {
  const [price, setPrice] = useState(12000);

  const commission = price * 0.1;
  const points = commission * PTS_PER_RS;
  const unlocked = points >= MIN_WITHDRAW_PTS;
  const fillPct = ((price - MIN) / (MAX - MIN)) * 100;

  const rows = useMemo(
    () => [
      { label: "Project price", value: `₹${inr(price)}`, accent: false },
      { label: "Your commission (10%)", value: `₹${inr(commission)}`, accent: false },
      { label: "Points earned", value: `${inr(points)} pts`, accent: true },
    ],
    [price, commission, points]
  );

  return (
    <section id="calculator" className="relative bg-canvas-soft py-24 md:py-32">
      <div className="noise absolute inset-0" />
      <div className="relative mx-auto max-w-6xl px-5">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <FadeIn>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-primary">
              Points calculator
            </p>
            <BlurText
              text="See exactly what one referral is worth"
              animateBy="words"
              delay={60}
              threshold={0.2}
              tag="h2"
              className="display mt-3 text-4xl text-ink md:text-5xl"
            />
            <p className="mt-4 max-w-md text-base leading-relaxed text-ink-mute">
              Drag the slider to a typical project price. Every ₹1 you earn as
              commission becomes 4 points — and 2,000 points unlock a ₹500
              withdrawal.
            </p>

            <div className="mt-10">
              <div className="flex items-baseline justify-between">
                <label
                  htmlFor="price"
                  className="text-sm font-medium text-ink-secondary"
                >
                  Project price
                </label>
                <span className="tabular display text-3xl text-ink">
                  ₹{inr(price)}
                </span>
              </div>
              <input
                id="price"
                type="range"
                min={MIN}
                max={MAX}
                step={STEP}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="mt-5 w-full"
                style={{ ["--fill" as string]: `${fillPct}%` }}
              />
              <div className="mt-2 flex justify-between font-mono text-[12px] text-ink-mute">
                <span>₹{inr(MIN)}</span>
                <span>₹{inr(MAX)}</span>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="rounded-3xl border border-hairline bg-canvas p-7 shadow-[0_24px_64px_rgba(13,37,61,0.09)] md:p-9">
              <div className="flex items-center justify-between border-b border-hairline pb-5">
                <p className="text-sm font-medium text-ink-secondary">
                  Your earnings
                </p>
                <span
                  className={`rounded-full px-3 py-1 text-[12px] font-medium ${
                    unlocked
                      ? "bg-mint/10 text-mint"
                      : "bg-canvas-soft text-ink-mute"
                  }`}
                >
                  {unlocked ? "Withdrawal unlocked ✓" : "₹500 needed to unlock"}
                </span>
              </div>

              <div className="space-y-4 py-6">
                {rows.map((r, i) => (
                  <motion.div
                    key={r.label}
                    initial={false}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between"
                  >
                    <span className="text-[14.5px] text-ink-mute">
                      {r.label}
                    </span>
                    <motion.span
                      key={r.value}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.05 }}
                      className={`tabular text-lg font-medium ${
                        r.accent ? "text-primary" : "text-ink"
                      }`}
                    >
                      {r.value}
                    </motion.span>
                  </motion.div>
                ))}
              </div>

              {/* Progress to first withdrawal */}
              <div className="rounded-2xl bg-canvas-soft p-5">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-ink-mute">Progress to ₹500 withdrawal</span>
                  <span className="tabular font-medium text-ink">
                    {Math.min(100, Math.round((points / MIN_WITHDRAW_PTS) * 100))}%
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-hairline">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-magenta"
                    animate={{
                      width: `${Math.min(100, (points / MIN_WITHDRAW_PTS) * 100)}%`,
                    }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <p className="mt-3 text-[12.5px] text-ink-mute">
                  {unlocked
                    ? "You're ready to withdraw. Share one more referral to keep growing."
                    : `${inr(MIN_WITHDRAW_PTS - points)} more points to your first ₹500.`}
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
