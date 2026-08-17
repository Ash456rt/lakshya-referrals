import FadeIn from "@/components/ui/FadeIn";
import BlurText from "@/components/reactbits/TextAnimations/BlurText/BlurText";

const testimonials = [
  {
    quote:
      "I referred my cousin for his shop's website. The ₹800 landed in my bank the next morning — no questions, no chasing.",
    name: "Arjun Mehta",
    role: "Referred 6 clients · ₹6,400 earned",
    initials: "AM",
  },
  {
    quote:
      "The points system finally made sense to me. Every referral shows its exact status, and withdrawals genuinely take under 24 hours.",
    name: "Kavya Nair",
    role: "Referred 4 clients · ₹5,100 earned",
    initials: "KN",
  },
  {
    quote:
      "I just share my link in college groups. Three classmates got their projects built and I crossed my first ₹500 payout in a month.",
    name: "Vikram Singh",
    role: "Student · 1st withdrawal done",
    initials: "VS",
  },
];

export default function Testimonials() {
  return (
    <section className="border-t border-hairline bg-canvas py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-primary">
            Referrers in their own words
          </p>
          <BlurText
            text="Real people, real payouts"
            animateBy="words"
            delay={60}
            threshold={0.2}
            tag="h2"
            className="display mt-3 text-4xl text-ink md:text-5xl"
          />
        </FadeIn>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.1}>
              <figure className="flex h-full flex-col rounded-2xl border border-hairline bg-canvas-soft p-7">
                <div className="flex gap-0.5 text-primary" aria-label="5 stars">
                  {"★★★★★".split("").map((s, j) => (
                    <span key={j} className="text-[15px]">
                      {s}
                    </span>
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-ink-secondary">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-hairline pt-5">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-magenta text-[12px] font-medium text-white">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-ink">{t.name}</p>
                    <p className="text-[12.5px] text-ink-mute">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
