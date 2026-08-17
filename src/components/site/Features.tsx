import SpotlightCard from "@/components/reactbits/Components/SpotlightCard/SpotlightCard";
import FadeIn from "@/components/ui/FadeIn";
import BlurText from "@/components/reactbits/TextAnimations/BlurText/BlurText";

const features = [
  {
    icon: "↗",
    title: "Live referral tracking",
    body: "Every click, signup, and payment is tracked in real time. You always know exactly where each referral stands.",
  },
  {
    icon: "₹",
    title: "Payouts in 24 hours",
    body: "Request a withdrawal with your bank details and the money is transferred within a day. No 30-day waits.",
  },
  {
    icon: "◎",
    title: "No cap on earnings",
    body: "Refer 5 people or 500. The 10% commission applies to every single paid project, with no ceiling.",
  },
  {
    icon: "▤",
    title: "Bank details kept secure",
    body: "Your account and IFSC are encrypted and only visible to our payout team for the transfer — never on your profile.",
  },
  {
    icon: "⇄",
    title: "Refund-safe ledger",
    body: "Every point is logged with a reason. If a client refunds, the points are adjusted transparently — no silent surprises.",
  },
  {
    icon: "◈",
    title: "Your link, your reach",
    body: "Share on WhatsApp, Instagram, or Telegram. We shorten it, track it, and credit you on first attribution.",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-primary">
            Why Lakshya Referrals
          </p>
          <BlurText
            text="Built like a payments product, not a points gimmick"
            animateBy="words"
            delay={60}
            threshold={0.2}
            tag="h2"
            className="display mt-3 text-4xl text-ink md:text-5xl"
          />
          <p className="mt-4 text-base leading-relaxed text-ink-mute">
            We designed the program the way we'd want to be paid ourselves —
            transparent, fast, and boringly reliable.
          </p>
        </FadeIn>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={(i % 3) * 0.08}>
              <SpotlightCard
                spotlightColor="rgba(83, 58, 253, 0.10)"
                className="h-full rounded-2xl border border-hairline bg-canvas p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(13,37,61,0.08)]"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-tint text-lg text-primary">
                  {f.icon}
                </div>
                <h3 className="mt-5 text-[17px] font-medium tracking-tight text-ink">
                  {f.title}
                </h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-ink-mute">
                  {f.body}
                </p>
              </SpotlightCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
