"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import FadeIn from "@/components/ui/FadeIn";
import BlurText from "@/components/reactbits/TextAnimations/BlurText/BlurText";

const faqs = [
  {
    q: "When exactly do I earn the commission?",
    a: "The moment your referred client's payment is confirmed for a project, 10% of that amount converts to points in your account. Not when they sign up, and not when they ask for a quote — only when the money actually lands.",
  },
  {
    q: "How do points become rupees?",
    a: "₹1 of commission = 4 points. So 2,000 points = ₹500, which is the minimum withdrawal amount. There's no upper limit — you can withdraw any amount above that whenever you like.",
  },
  {
    q: "How do I receive my money?",
    a: "You request a withdrawal and enter your bank details (account holder, account number, IFSC). Our payout team verifies it and transfers the money via UPI/IMPS/NEFT — you'll have it within 24 hours.",
  },
  {
    q: "Can one person be referred twice?",
    a: "No. The first referral link someone clicks is the one that counts (first attribution wins). It keeps things fair for everyone and prevents double-claiming.",
  },
  {
    q: "What happens if a client refunds?",
    a: "The commission points from that order are deducted back from your balance. Every point in your ledger is logged with a reason, so you'll always see exactly why a deduction happened.",
  },
  {
    q: "Is there a limit on how many people I can refer?",
    a: "None. Share your link with 5 people or 500 — the 10% commission applies to every paid project, forever.",
  },
];

function Item({ q, a, open, onClick }: {
  q: string;
  a: string;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border-b border-hairline">
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-[15.5px] font-medium tracking-tight text-ink">
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-hairline text-lg leading-none text-primary"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-6 pr-10 text-[14.5px] leading-relaxed text-ink-mute">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="bg-canvas-soft py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[380px_1fr]">
        <FadeIn>
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-primary">
            FAQ
          </p>
          <BlurText
            text="Questions, answered straight"
            animateBy="words"
            delay={60}
            threshold={0.2}
            tag="h2"
            className="display mt-3 text-4xl text-ink md:text-5xl"
          />
          <p className="mt-4 max-w-sm text-base leading-relaxed text-ink-mute">
            Anything else? Message us on WhatsApp and a real human replies —
            usually within the hour.
          </p>
          <a
            href="#get-link"
            className="mt-6 inline-block text-[15px] font-medium text-primary underline-offset-4 hover:underline"
          >
            Ask us anything →
          </a>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="rounded-2xl border border-hairline bg-canvas px-6 md:px-8">
            {faqs.map((f, i) => (
              <Item
                key={f.q}
                q={f.q}
                a={f.a}
                open={open === i}
                onClick={() => setOpen(open === i ? -1 : i)}
              />
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
