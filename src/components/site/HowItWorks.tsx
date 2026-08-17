import FadeIn from "@/components/ui/FadeIn";
import BlurText from "@/components/reactbits/TextAnimations/BlurText/BlurText";

const steps = [
  {
    n: "01",
    title: "Get your link",
    body: "Sign up and grab your unique referral link. Share it on WhatsApp, Instagram, or anywhere your friends hang out.",
  },
  {
    n: "02",
    title: "They pay for a project",
    body: "Your friend clicks the link, signs up, and pays us to build their website, app, or automation project.",
  },
  {
    n: "03",
    title: "10% lands as points",
    body: "The moment their payment is confirmed, 10% of it converts to points in your account. ₹1 = 4 points, tracked live.",
  },
  {
    n: "04",
    title: "Withdraw in 24 hours",
    body: "Cross 2,000 points (₹500) and request a withdrawal with your bank details. We transfer the money within 24 hours.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-primary">
            How it works
          </p>
          <BlurText
            text="Earn while your friends get their projects built"
            animateBy="words"
            delay={60}
            threshold={0.2}
            tag="h2"
            className="display mt-3 text-4xl text-ink md:text-5xl"
          />
          <p className="mt-4 text-base leading-relaxed text-ink-mute">
            No forms, no thresholds, no waiting months. Four steps between you
            and your first payout.
          </p>
        </FadeIn>

        <div className="relative mt-16 grid gap-10 md:grid-cols-4 md:gap-6">
          <div
            aria-hidden
            className="absolute top-7 right-[12%] left-[12%] hidden h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent md:block"
          />
          {steps.map((s, i) => (
            <FadeIn key={s.n} delay={i * 0.1} className="relative">
              <div className="relative z-10 grid h-14 w-14 place-items-center rounded-2xl border border-hairline bg-canvas font-mono text-sm text-primary shadow-[0_4px_20px_rgba(83,58,253,0.12)]">
                {s.n}
              </div>
              <h3 className="mt-5 text-lg font-medium tracking-tight text-ink">
                {s.title}
              </h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-ink-mute">
                {s.body}
              </p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
