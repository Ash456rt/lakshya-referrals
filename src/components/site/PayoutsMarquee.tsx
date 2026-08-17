/* ✏️ EDIT YOUR PAYOUT EXAMPLES HERE — replace with real payouts once the program runs. */
const payouts = [
  { who: "Priya M.", what: "withdrew ₹500", when: "just now" },
  { who: "Arjun K.", what: "earned 1,600 pts", when: "4 min ago" },
  { who: "Rahul S.", what: "got paid ₹1,200", when: "11 min ago" },
  { who: "Sneha R.", what: "crossed 2,000 pts", when: "26 min ago" },
  { who: "Amit V.", what: "referred a new client", when: "38 min ago" },
  { who: "Kavya N.", what: "withdrew ₹500", when: "1 hr ago" },
  { who: "Vikram T.", what: "earned 800 pts", when: "1 hr ago" },
  { who: "Ishita P.", what: "got paid ₹2,400", when: "2 hrs ago" },
];

/* 🎚️ Speed: seconds for one full loop (smaller = faster). */
const LOOP_SECONDS = 28;

function Item({ p }: { p: (typeof payouts)[number] }) {
  return (
    <span className="flex shrink-0 items-center gap-2.5 text-[14px] text-ink-secondary">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-magenta text-[10px] font-medium text-white">
        {p.who.charAt(0)}
      </span>
      <span className="font-medium text-ink">{p.who}</span>
      <span>{p.what}</span>
      <span className="text-ink-mute">· {p.when}</span>
      <span className="mx-5 text-primary/40">✦</span>
    </span>
  );
}

/** Endless scrolling strip of recent payouts — social proof for the program. */
export default function PayoutsMarquee() {
  const loop = [...payouts, ...payouts];

  return (
    <div className="border-y border-hairline bg-canvas py-4">
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div
          className="animate-marquee flex w-max items-center"
          style={{ animationDuration: `${LOOP_SECONDS}s` }}
        >
          {loop.map((p, i) => (
            <Item key={i} p={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
