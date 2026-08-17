"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { inr, fmtDate } from "@/lib/format";
import ThemeToggle from "@/components/theme/ThemeToggle";

type MeData = {
  user: { id: number; name: string; email: string; referral_code: string };
  balance: number;
  referralLink: string;
  referrals: {
    id: number;
    referred_name: string;
    referred_email: string;
    status: string;
    created_at: string;
  }[];
  ledger: { id: number; points: number; reason: string; created_at: string }[];
  withdrawals: {
    id: number;
    points: number;
    amount_rs: number;
    bank_name: string;
    status: string;
    txn_ref: string | null;
    notes: string | null;
    requested_at: string;
    paid_at: string | null;
  }[];
};

const STATUS: Record<string, { label: string; cls: string }> = {
  signed_up: { label: "Signed up", cls: "bg-canvas-soft text-ink-mute" },
  ordered: { label: "Order placed", cls: "bg-amber-400/10 text-amber-600" },
  paid: { label: "Commission paid", cls: "bg-mint/10 text-mint" },
  refunded: { label: "Refunded", cls: "bg-ruby/10 text-ruby" },
};

type Tab = "overview" | "withdraw";

export default function Dashboard({
  user,
}: {
  user: { id: number; name: string; email: string; referral_code: string };
}) {
  const router = useRouter();
  const [data, setData] = useState<MeData | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formMsg, setFormMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/me");
    if (res.ok) setData(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(data!.referralLink);
    } catch {
      /* ignore */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function onWithdraw(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setFormMsg(null);
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const body = {
      points: Number(fd.get("points")),
      bankName: String(fd.get("bankName")),
      accountHolder: String(fd.get("accountHolder")),
      accountNo: String(fd.get("accountNo")),
      ifsc: String(fd.get("ifsc")),
    };

    try {
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data2 = await res.json();
      if (!res.ok) {
        setFormError(data2.error ?? "Request failed");
      } else {
        setFormMsg(
          "Withdrawal requested ✅ Our team has been emailed your bank details. Money lands within 24 hours."
        );
        e.currentTarget.reset();
        load();
      }
    } catch {
      setFormError("Network error — try again");
    } finally {
      setSubmitting(false);
    }
  }

  if (!data) {
    return (
      <main className="grid min-h-screen place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </main>
    );
  }

  const balanceRs = Math.floor(data.balance / 4);
  const minPts = 2000;

  return (
    <main className="min-h-screen bg-canvas-soft">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <a href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-magenta text-white">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 3v18M12 3l-6 6M12 3l6 6"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="text-[15px] font-medium tracking-tight text-ink">
              Lakshya <span className="font-semibold text-primary">Referrals</span>
            </span>
          </a>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <span className="hidden text-[13.5px] text-ink-mute sm:block">
              Hi, {user.name.split(" ")[0]}
            </span>
            <button
              onClick={logout}
              className="rounded-full border border-hairline px-4 py-2 text-[13px] font-medium text-ink-secondary transition-colors hover:border-ruby/40 hover:text-ruby"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10">
        {/* Tabs */}
        <div className="flex gap-2">
          {(
            [
              ["overview", "Overview"],
              ["withdraw", "Withdraw"],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-full px-5 py-2.5 text-[14px] font-medium transition-colors ${
                tab === key
                  ? "bg-ink text-white"
                  : "border border-hairline bg-canvas text-ink-secondary hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "overview" ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Left: referrals */}
            <div>
              <div className="rounded-2xl border border-hairline bg-canvas p-6 md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h1 className="display text-2xl text-ink">Your referrals</h1>
                    <p className="mt-1 text-[13.5px] text-ink-mute">
                      {data.referrals.length === 0
                        ? "No one yet — share your link and be the first to earn."
                        : `${data.referrals.length} people referred · ${data.referrals.filter((r) => r.status === "paid").length} paid`}
                    </p>
                  </div>
                </div>

                {/* Link box */}
                <div className="mt-6 flex items-center gap-2 rounded-2xl border border-primary/25 bg-primary-tint/50 p-2 pl-4">
                  <span className="truncate font-mono text-[13px] text-ink-secondary">
                    {data.referralLink}
                  </span>
                  <button
                    onClick={copyLink}
                    className={`ml-auto shrink-0 rounded-xl px-4 py-2.5 text-[13px] font-medium text-white transition-colors ${
                      copied ? "bg-mint" : "bg-primary hover:bg-primary-deep"
                    }`}
                  >
                    {copied ? "Copied ✓" : "Copy"}
                  </button>
                </div>

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[540px] text-left">
                    <thead>
                      <tr className="border-b border-hairline text-[12px] uppercase tracking-wider text-ink-mute">
                        <th className="pb-3 pr-4 font-medium">Person</th>
                        <th className="pb-3 pr-4 font-medium">Status</th>
                        <th className="pb-3 font-medium">Referred on</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.referrals.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="py-10 text-center text-[14px] text-ink-mute"
                          >
                            Nothing here yet. Share your link on WhatsApp and
                            start earning.
                          </td>
                        </tr>
                      ) : (
                        data.referrals.map((r) => (
                          <tr
                            key={r.id}
                            className="border-b border-hairline/60 last:border-0"
                          >
                            <td className="py-4 pr-4">
                              <p className="text-[14.5px] font-medium text-ink">
                                {r.referred_name}
                              </p>
                              <p className="text-[12.5px] text-ink-mute">
                                {r.referred_email}
                              </p>
                            </td>
                            <td className="py-4 pr-4">
                              <span
                                className={`rounded-full px-3 py-1 text-[12px] font-medium ${STATUS[r.status]?.cls ?? "bg-canvas-soft text-ink-mute"}`}
                              >
                                {STATUS[r.status]?.label ?? r.status}
                              </span>
                            </td>
                            <td className="py-4 text-[13px] text-ink-mute">
                              {fmtDate(r.created_at)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Ledger */}
              <div className="mt-6 rounded-2xl border border-hairline bg-canvas p-6 md:p-8">
                <h2 className="text-[15px] font-medium text-ink">
                  Points ledger
                </h2>
                <div className="mt-4 space-y-3">
                  {data.ledger.length === 0 ? (
                    <p className="py-6 text-center text-[14px] text-ink-mute">
                      No activity yet.
                    </p>
                  ) : (
                    data.ledger.map((l) => (
                      <div
                        key={l.id}
                        className="flex items-center justify-between gap-4 rounded-xl bg-canvas-soft px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[13.5px] text-ink">
                            {l.reason}
                          </p>
                          <p className="text-[12px] text-ink-mute">
                            {fmtDate(l.created_at)}
                          </p>
                        </div>
                        <span
                          className={`tabular shrink-0 text-[14.5px] font-semibold ${
                            l.points >= 0 ? "text-mint" : "text-ruby"
                          }`}
                        >
                          {l.points >= 0 ? "+" : ""}
                          {inr(l.points)} pts
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right: balance */}
            <div className="space-y-6">
              <div className="overflow-hidden rounded-2xl bg-night p-6 text-white">
                <p className="text-[12px] uppercase tracking-wider text-white/45">
                  Your balance
                </p>
                <p className="tabular display mt-2 text-5xl">
                  ₹{inr(balanceRs)}
                </p>
                <p className="tabular mt-1 font-mono text-[13px] text-mint">
                  {inr(data.balance)} points
                </p>
                <div className="mt-5">
                  <div className="flex justify-between text-[12px] text-white/50">
                    <span>Withdrawal unlocked at 2,000 pts</span>
                    <span>
                      {Math.min(100, Math.round((data.balance / minPts) * 100))}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-magenta transition-all"
                      style={{
                        width: `${Math.min(100, (data.balance / minPts) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => setTab("withdraw")}
                  disabled={data.balance < minPts}
                  className="mt-6 w-full rounded-xl bg-primary py-3 text-[14px] font-medium text-white transition-colors hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {data.balance >= minPts
                    ? "Withdraw to your bank"
                    : `${inr(minPts - data.balance)} pts to unlock`}
                </button>
                <p className="mt-3 text-center text-[12px] text-white/40">
                  Paid within 24 hours · 4 points = ₹1
                </p>
              </div>

              <div className="rounded-2xl border border-hairline bg-canvas p-6">
                <h2 className="text-[15px] font-medium text-ink">
                  Withdrawal history
                </h2>
                {data.withdrawals.length === 0 ? (
                  <p className="mt-3 text-[13.5px] text-ink-mute">
                    No withdrawals yet.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {data.withdrawals.map((w) => (
                      <div
                        key={w.id}
                        className="flex items-center justify-between rounded-xl border border-hairline px-4 py-3"
                      >
                        <div>
                          <p className="tabular text-[14px] font-medium text-ink">
                            ₹{inr(w.amount_rs)}
                          </p>
                          <p className="text-[12px] text-ink-mute">
                            {fmtDate(w.requested_at)}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-[11.5px] font-medium ${
                            w.status === "paid"
                              ? "bg-mint/10 text-mint"
                              : w.status === "rejected"
                                ? "bg-ruby/10 text-ruby"
                                : "bg-amber-400/10 text-amber-600"
                          }`}
                        >
                          {w.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto mt-8 max-w-lg">
            <div className="rounded-2xl border border-hairline bg-canvas p-7 md:p-9">
              <h1 className="display text-2xl text-ink">Withdraw your points</h1>
              <p className="mt-2 text-[14px] text-ink-mute">
                Available balance:{" "}
                <span className="tabular font-semibold text-ink">
                  {inr(data.balance)} pts
                </span>{" "}
                (₹{inr(balanceRs)}). Minimum 2,000 points. Money is transferred
                within 24 hours of your request.
              </p>

              <form onSubmit={onWithdraw} className="mt-7 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm text-ink-secondary">
                      Points
                    </label>
                    <input
                      name="points"
                      type="number"
                      required
                      min={minPts}
                      max={data.balance}
                      step={100}
                      defaultValue={minPts}
                      className="w-full rounded-xl border border-hairline px-4 py-3 text-[15px] outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm text-ink-secondary">
                      You'll get
                    </label>
                    <input
                      disabled
                      value={`₹${inr(minPts / 4)}`}
                      className="w-full rounded-xl border border-hairline bg-canvas-soft px-4 py-3 text-[15px] text-ink-mute"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-ink-secondary">
                    Bank name
                  </label>
                  <input
                    name="bankName"
                    required
                    placeholder="e.g. HDFC Bank"
                    className="w-full rounded-xl border border-hairline px-4 py-3 text-[15px] outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-ink-secondary">
                    Account holder name
                  </label>
                  <input
                    name="accountHolder"
                    required
                    placeholder="As it appears on your passbook"
                    className="w-full rounded-xl border border-hairline px-4 py-3 text-[15px] outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm text-ink-secondary">
                      Account number
                    </label>
                    <input
                      name="accountNo"
                      required
                      inputMode="numeric"
                      pattern="[0-9]{6,18}"
                      placeholder="6–18 digits"
                      className="w-full rounded-xl border border-hairline px-4 py-3 text-[15px] outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm text-ink-secondary">
                      IFSC code
                    </label>
                    <input
                      name="ifsc"
                      required
                      placeholder="HDFC0001234"
                      className="w-full rounded-xl border border-hairline px-4 py-3 font-mono text-[14px] uppercase outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                </div>

                {formError && (
                  <p className="rounded-xl bg-ruby/8 px-4 py-3 text-[13.5px] text-ruby">
                    {formError}
                  </p>
                )}
                {formMsg && (
                  <p className="rounded-xl bg-mint/10 px-4 py-3 text-[13.5px] text-mint">
                    {formMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting || data.balance < minPts}
                  className="w-full rounded-xl bg-primary py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-primary-deep disabled:opacity-50"
                >
                  {submitting ? "Requesting…" : "Request withdrawal"}
                </button>
                <p className="text-center text-[12.5px] text-ink-mute">
                  Your bank details are encrypted and only visible to our payout
                  team.
                </p>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
