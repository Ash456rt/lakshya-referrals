"use client";

import CountUp from "@/components/reactbits/TextAnimations/CountUp/CountUp";
import FadeIn from "@/components/ui/FadeIn";

const stats = [
  {
    prefix: "₹",
    value: 4.2,
    decimals: 1,
    suffix: "L+",
    label: "paid out to referrers",
  },
  {
    prefix: "",
    value: 380,
    decimals: 0,
    suffix: "+",
    label: "projects referred & built",
  },
  {
    prefix: "",
    value: 1200,
    decimals: 0,
    suffix: "+",
    label: "active referrers",
  },
  {
    prefix: "<",
    value: 24,
    decimals: 0,
    suffix: " hrs",
    label: "average payout time",
  },
];

export default function Stats() {
  return (
    <section className="border-y border-hairline bg-canvas-soft">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-10 px-5 py-14 md:grid-cols-4 md:py-16">
        {stats.map((s, i) => (
          <FadeIn key={s.label} delay={i * 0.08} className="text-center">
            <div className="tabular display text-4xl text-ink md:text-5xl">
              <span>{s.prefix}</span>
              <CountUp
                to={s.value}
                duration={1.6}
                delay={0.2}
                separator=""
                className="tabular"
              />
              <span>{s.suffix}</span>
            </div>
            <p className="mt-2 text-[13.5px] text-ink-mute">{s.label}</p>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
