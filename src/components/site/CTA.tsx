"use client";

import FadeIn from "@/components/ui/FadeIn";
import Magnet from "@/components/reactbits/Animations/Magnet/Magnet";

export default function CTA() {
  return (
    <section id="get-link" className="relative overflow-hidden py-28 md:py-36">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-deep to-[#1f1a6b]" />
        <div className="absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(70%_70%_at_50%_50%,black,transparent)]" />
        <div className="noise absolute inset-0" />
      </div>

      <FadeIn className="relative mx-auto max-w-3xl px-5 text-center">
        <p className="font-mono text-[12.5px] uppercase tracking-[0.16em] text-white/60">
          Free to join · No cap · 24h payouts
        </p>
        <h2 className="display mt-4 text-4xl text-white md:text-6xl">
          Your first ₹500 is one
          <span className="text-magenta"> good referral </span>
          away
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/70">
          Someone you know needs a project built. They get it done right, and
          you get paid for making the introduction. That's the whole deal.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Magnet padding={48} magnetStrength={1.8}>
            <a
              href="#top"
              className="rounded-full bg-white px-8 py-3.5 text-[15px] font-medium text-primary-deep shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-transform hover:scale-[1.02]"
            >
              Get your referral link
            </a>
          </Magnet>
          <a
            href="#how-it-works"
            className="rounded-full border border-white/25 px-8 py-3.5 text-[15px] font-medium text-white transition-colors hover:border-white/50"
          >
            How it works
          </a>
        </div>
        <p className="mt-6 text-[13px] text-white/50">
          Already have an account?{" "}
          <a href="#top" className="text-white underline-offset-4 hover:underline">
            Sign in to see your points →
          </a>
        </p>
      </FadeIn>
    </section>
  );
}
