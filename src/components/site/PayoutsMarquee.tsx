import { db } from "@/lib/db";

/* ✏️ EDIT YOUR PAYOUT EXAMPLES HERE — shown only until real paid withdrawals exist. */
const samplePayouts = [
  { who: "Priya", what: "withdrew ₹500", when: "just now" },
  { who: "Arjun", what: "earned 1,600 pts", when: "4 min ago" },
  { who: "Rahul", what: "got paid ₹1,200", when: "11 min ago" },
  { who: "Sneha", what: "crossed 2,000 pts", when: "26 min ago" },
  { who: "Amit", what: "referred a new client", when: "38 min ago" },
  { who: "Kavya", what: "withdrew ₹500", when: "1 hr ago" },
  { who: "Vikram", what: "earned 800 pts", when: "1 hr ago" },
  { who: "Ishita", what: "got paid ₹2,400", when: "2 hrs ago" },
];

/* 🎚️ Speed: seconds for one full loop (smaller = faster). */
const LOOP_SECONDS = 28;

// Privacy: show only the first name on the public landing page.
function shortName(full: string) {
  return full.trim().split(/\s+/)[0] ?? full;
}

function timeAgo(iso: string | null): string {
  if (!iso) return "recently";
  const t = new Date(iso.includes("T") ? iso : iso.replace(" ", "T") + "Z").getTime();
  const mins = Math.round((Date.now() - t) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.round(hrs / 24)} days ago`;
}

function Item({ p }: { p: { who: string; what: string; when: string } }) {
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

/**
 * Endless scrolling strip of recent payouts. Uses real paid withdrawals from
 * the database once they exist; falls back to the sample list above.
 */
export default async function PayoutsMarquee() {
  const real = db
    .prepare(
      `SELECT u.name, w.amount_rs, w.paid_at
       FROM withdrawals w JOIN users u ON u.id = w.user_id
       WHERE w.status = 'paid'
       ORDER BY w.paid_at DESC LIMIT 10`
    )
    .all() as { name: string; amount_rs: number; paid_at: string | null }[];

  const payouts = real.length
    ? real.map((r) => ({
        who: shortName(r.name),
        what: `got paid ₹${r.amount_rs.toLocaleString("en-IN")}`,
        when: timeAgo(r.paid_at),
      }))
    : samplePayouts;

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
