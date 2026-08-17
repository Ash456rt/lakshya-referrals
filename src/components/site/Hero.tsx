"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Aurora from "@/components/reactbits/Backgrounds/Aurora/Aurora";
import BlurText from "@/components/reactbits/TextAnimations/BlurText/BlurText";
import GradientText from "@/components/reactbits/TextAnimations/GradientText/GradientText";
import ShinyText from "@/components/reactbits/TextAnimations/ShinyText/ShinyText";
import Magnet from "@/components/reactbits/Animations/Magnet/Magnet";
import RotatingWord from "@/components/site/RotatingWord";

const LINK = "lakshyareferrals.in/r/ASH456";

function CopyLink() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${LINK}`);
    } catch {
      /* clipboard unavailable — still show feedback */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex w-full max-w-md items-center gap-2 rounded-full border border-hairline bg-canvas p-1.5 pl-5 shadow-[0_8px_32px_rgba(13,37,61,0.08)]">
      <span className="font-mono text-[13px] text-ink-mute">{LINK}</span>
      <button
        onClick={copy}
        className={`ml-auto shrink-0 rounded-full px-4 py-2.5 text-[13px] font-medium transition-all ${
          copied
            ? "bg-mint text-white"
            : "bg-primary text-white hover:bg-primary-deep"
        }`}
      >
        {copied ? "Copied ✓" : "Copy link"}
      </button>
    </div>
  );
}

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Atmosphere */}
      <div className="absolute inset-0">
        <Aurora
          colorStops={["#533afd", "#f96bee", "#665efd"]}
          amplitude={0.55}
          blend={0.35}
          speed={0.35}
        />
      </div>
      <div className="absolute inset-0 hero-glow" />
      <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(70%_60%_at_50%_35%,black,transparent)]" />
      <div className="noise absolute inset-0" />

      <div className="relative mx-auto max-w-6xl px-5 pt-36 pb-20 md:pt-44 md:pb-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-canvas/70 px-3.5 py-1.5 backdrop-blur"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-mint" />
            <ShinyText
              text="Now live — 10% commission on every referral"
              speed={3}
              className="text-[12.5px] font-medium text-ink-secondary"
              shineColor="#533afd"
              spread={90}
            />
          </motion.div>

          <h1 className="display text-[42px] leading-[1.04] text-ink md:text-[64px]">
            <BlurText
              text="Refer a friend."
              animateBy="words"
              delay={140}
              className="block"
              tag="span"
            />
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              Earn 10% on every{" "}
              <RotatingWord
                words={["website", "mobile app", "WhatsApp bot", "automation"]}
                className="bg-gradient-to-r from-primary via-magenta to-primary-soft bg-clip-text text-transparent"
              />{" "}
              they build with us.
            </motion.span>
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-ink-mute md:text-lg"
          >
            Share your link. When someone you referred{" "}
            <GradientText
              colors={["#533afd", "#ea2261", "#665efd"]}
              animationSpeed={7}
            >
              pays for a project
            </GradientText>
            , 10% lands in your account as points — and you can withdraw it to
            your bank in under 24 hours.
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-9 flex w-full flex-col items-center gap-3"
          >
            <CopyLink />
            <div className="flex items-center gap-4 text-[13px] text-ink-mute">
              <span className="flex items-center gap-1.5">
                <span className="text-mint">✓</span> No cap on referrals
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-mint">✓</span> ₹500 minimum payout
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-mint">✓</span> 24-hour transfers
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Magnet padding={48} magnetStrength={1.8}>
              <a
                href="#how-it-works"
                className="rounded-full bg-ink px-7 py-3 text-[15px] font-medium text-white transition-colors hover:bg-ink-secondary"
              >
                See how it works
              </a>
            </Magnet>
            <Magnet padding={48} magnetStrength={1.8}>
              <a
                href="#calculator"
                className="rounded-full border border-hairline bg-canvas/80 px-7 py-3 text-[15px] font-medium text-ink backdrop-blur transition-colors hover:border-primary/30 hover:text-primary"
              >
                Try the calculator
              </a>
            </Magnet>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
