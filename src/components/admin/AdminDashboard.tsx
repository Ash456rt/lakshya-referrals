"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { inr, fmtDate, slaLabel } from "@/lib/format";
import ThemeToggle from "@/components/theme/ThemeToggle";

type Overview = {
  stats: {
    totalUsers: number;
    totalReferrals: number;
    paidReferrals: number;
    paidOutRs: number;
    pendingWithdrawals: number;
    pendingValueRs: number;
  };
  withdrawals: {
    id: number;
    userName: string;
    userEmail: string;
    points: number;
    amountRs: number;
    bankName: string;
    accountHolder: string;
    accountNo: string;
    ifsc: string;
    status: string;
    txnRef: string | null;
    notes: string | null;
    requestedAt: string;
    paidAt: string | null;
    slaHours: number;
  }[];
  referralSummary: {
    id: number;
    name: string;
    email: string;
    total: number;
    paid: number;
    pending: number;
  }[];
  recentOrders: {
    id: number;
    client_name: string;
    client_email: string;
    project_name: string;
    amount_rs: number;
    status: string;
    created_at: string;
  }[];
  adminEmails: string[];
};

const W_STATUS: Record<string, { label: string; cls: string }> = {
  requested: { label: "Requested", cls: "bg-amber-400/10 text-amber-600" },
  approved: { label: "Approved", cls: "bg-primary-tint text-primary" },
  paid: { label: "Paid", cls: "bg-mint/10 text-mint" },
  rejected: { label: "Rejected", cls: "bg-ruby/10 text-ruby" },
};

const O_STATUS: Record<string, { label: string; cls: string }> = {
  placed: { label: "Placed", cls: "bg-canvas-soft text-ink-mute" },
  paid: { label: "Paid", cls: "bg-mint/10 text-mint" },
  refunded: { label: "Refunded", cls: "bg-ruby/10 text-ruby" },
};

function maskAccount(no: string) {
  return "•••• " + no.slice(-4);
}

export default function AdminDashboard({
  user,
}: {
  user: { name: string; role: string };
}) {
  const router = useRouter();
  const [data, setData] = useState<Overview | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [txnRefs, setTxnRefs] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [orderForm, setOrderForm] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/overview");
    if (res.ok) setData(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [load]);

  async function act(id: number, action: string, extra: Record<string, string> = {}) {
    setBusy(id);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const d = await res.json();
      if (!res.ok) {
        setMsg({ ok: false, text: d.error ?? "Action failed" });
      } else {
        setMsg({ ok: true, text: `Withdrawal #${id} ${action}d` });
        load();
      }
    } catch {
      setMsg({ ok: false, text: "Network error" });
    } finally {
      setBusy(null);
    }
  }

  async function onCreateOrder(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientEmail: fd.get("clientEmail"),
          clientName: fd.get("clientName"),
          projectName: fd.get("projectName"),
          amountRs: Number(fd.get("amountRs")),
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        setMsg({ ok: false, text: d.error ?? "Failed to create order" });
      } else {
        setMsg({ ok: true, text: `Order #${d.orderId} created` });
        e.currentTarget.reset();
        setOrderForm(false);
        load();
      }
    } catch {
      setMsg({ ok: false, text: "Network error" });
    }
  }

  async function onOrderAction(id: number, action: string) {
    setBusy(id);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const d = await res.json();
      if (!res.ok) {
        setMsg({ ok: false, text: d.error ?? "Action failed" });
      } else {
        setMsg({
          ok: true,
          text:
            action === "pay"
              ? d.credited
                ? `Order #${id} paid — +${d.credited.points} pts credited to referrer`
                : `Order #${id} marked paid (no referrer linked)`
              : `Order #${id} refunded — points clawed back`,
        });
        load();
      }
    } catch {
      setMsg({ ok: false, text: "Network error" });
    } finally {
      setBusy(null);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (!data) {
    return (
      <main className="grid min-h-screen place-items-center bg-night">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </main>
    );
  }

  const { stats } = data;
  const queue = data.withdrawals;

  return (
    <main className="min-h-screen bg-night pb-16 text-white">
      <header className="sticky top-0 z-40 border-b border-night-line bg-night/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
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
            <span className="text-[15px] font-medium tracking-tight">
              Lakshya Referrals <span className="text-white/40">· Admin</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle dark />
            <span className="hidden text-[13.5px] text-white/50 sm:block">
              {user.name}
            </span>
            <button
              onClick={logout}
              className="rounded-full border border-night-line px-4 py-2 text-[13px] font-medium text-white/70 transition-colors hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10">
        {msg && (
          <div
            className={`mb-6 rounded-xl px-5 py-3.5 text-[14px] ${
              msg.ok ? "bg-mint/10 text-mint" : "bg-ruby/10 text-ruby"
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Referrers", value: inr(stats.totalUsers) },
            { label: "Total referrals", value: inr(stats.totalReferrals) },
            { label: "Referrals paid", value: inr(stats.paidReferrals) },
            { label: "Paid out", value: `₹${inr(stats.paidOutRs)}` },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-night-line bg-night-soft p-5"
            >
              <p className="text-[12px] uppercase tracking-wider text-white/40">
                {s.label}
              </p>
              <p className="tabular mt-1.5 text-3xl font-medium">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Payout queue */}
        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-medium tracking-tight">
                Withdrawal queue
              </h2>
              <p className="mt-1 text-[13.5px] text-white/45">
                {stats.pendingWithdrawals} pending · ₹{inr(stats.pendingValueRs)}{" "}
                to transfer · SLA: 24 hours
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {queue.length === 0 ? (
              <p className="rounded-2xl border border-night-line bg-night-soft p-8 text-center text-[14px] text-white/40">
                No withdrawals yet.
              </p>
            ) : (
              queue.map((w) => {
                const sla = slaLabel(w.requestedAt);
                const isOpen = expanded === w.id;
                const active = w.status === "requested" || w.status === "approved";
                return (
                  <div
                    key={w.id}
                    className={`rounded-2xl border bg-night-soft transition-colors ${
                      sla.overdue && active
                        ? "border-ruby/50"
                        : "border-night-line"
                    }`}
                  >
                    <button
                      onClick={() => setExpanded(isOpen ? null : w.id)}
                      className="flex w-full flex-wrap items-center gap-4 px-5 py-4 text-left"
                    >
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-magenta text-[13px] font-medium">
                        {w.userName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[14.5px] font-medium">
                          {w.userName}
                          <span className="ml-2 text-[12.5px] text-white/40">
                            {w.userEmail}
                          </span>
                        </p>
                        <p className="tabular font-mono text-[12px] text-white/45">
                          {maskAccount(w.accountNo)} · {w.ifsc} · {w.bankName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="tabular text-[16px] font-medium">
                          ₹{inr(w.amountRs)}
                        </p>
                        <p className="font-mono text-[11.5px] text-white/40">
                          {inr(w.points)} pts
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-[12px] font-medium ${W_STATUS[w.status]?.cls ?? ""}`}
                      >
                        {W_STATUS[w.status]?.label ?? w.status}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 font-mono text-[11.5px] ${
                          sla.overdue && active
                            ? "bg-ruby/15 text-ruby"
                            : "bg-white/5 text-white/50"
                        }`}
                      >
                        {sla.text}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="border-t border-night-line px-5 py-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="rounded-xl bg-night p-4">
                            <p className="text-[11.5px] uppercase tracking-wider text-white/40">
                              Bank details
                            </p>
                            <dl className="mt-3 space-y-1.5 font-mono text-[13px]">
                              <div className="flex justify-between gap-4">
                                <dt className="text-white/40">Bank</dt>
                                <dd>{w.bankName}</dd>
                              </div>
                              <div className="flex justify-between gap-4">
                                <dt className="text-white/40">Holder</dt>
                                <dd>{w.accountHolder}</dd>
                              </div>
                              <div className="flex justify-between gap-4">
                                <dt className="text-white/40">A/C no</dt>
                                <dd className="tabular">{w.accountNo}</dd>
                              </div>
                              <div className="flex justify-between gap-4">
                                <dt className="text-white/40">IFSC</dt>
                                <dd>{w.ifsc}</dd>
                              </div>
                              <div className="flex justify-between gap-4">
                                <dt className="text-white/40">Requested</dt>
                                <dd className="tabular">
                                  {fmtDate(w.requestedAt)}
                                </dd>
                              </div>
                              {w.txnRef && (
                                <div className="flex justify-between gap-4">
                                  <dt className="text-white/40">Txn ref</dt>
                                  <dd>{w.txnRef}</dd>
                                </div>
                              )}
                              {w.notes && (
                                <div className="mt-2 rounded-lg bg-ruby/10 px-3 py-2 text-ruby">
                                  {w.notes}
                                </div>
                              )}
                            </dl>
                          </div>

                          <div className="flex flex-col justify-end gap-3">
                            {w.status === "requested" && (
                              <>
                                <button
                                  disabled={busy === w.id}
                                  onClick={() => act(w.id, "approve")}
                                  className="w-full rounded-xl border border-night-line py-3 text-[14px] font-medium text-white transition-colors hover:border-mint/50 hover:text-mint disabled:opacity-50"
                                >
                                  Approve — then transfer & mark paid
                                </button>
                                <div className="flex gap-2">
                                  <input
                                    placeholder="Txn ref (optional)"
                                    value={txnRefs[w.id] ?? ""}
                                    onChange={(e) =>
                                      setTxnRefs({ ...txnRefs, [w.id]: e.target.value })
                                    }
                                    className="flex-1 rounded-xl border border-night-line bg-night px-3.5 py-3 text-[13.5px] outline-none focus:border-mint/50"
                                  />
                                  <button
                                    disabled={busy === w.id}
                                    onClick={() =>
                                      act(w.id, "pay", { txnRef: txnRefs[w.id] ?? "" })
                                    }
                                    className="rounded-xl bg-mint px-5 text-[14px] font-medium text-night transition-colors hover:bg-mint/85 disabled:opacity-50"
                                  >
                                    Mark paid
                                  </button>
                                </div>
                                <input
                                  placeholder="Reason (required to reject)"
                                  value={notes[w.id] ?? ""}
                                  onChange={(e) =>
                                    setNotes({ ...notes, [w.id]: e.target.value })
                                  }
                                  className="rounded-xl border border-night-line bg-night px-3.5 py-3 text-[13.5px] outline-none focus:border-ruby/50"
                                />
                                <button
                                  disabled={busy === w.id || !(notes[w.id] ?? "").trim()}
                                  onClick={() =>
                                    act(w.id, "reject", {
                                      notes: (notes[w.id] ?? "").trim(),
                                    })
                                  }
                                  className="w-full rounded-xl border border-ruby/40 py-3 text-[14px] font-medium text-ruby transition-colors hover:bg-ruby/10 disabled:opacity-40"
                                >
                                  Reject & return points
                                </button>
                              </>
                            )}
                            {w.status === "approved" && (
                              <div className="flex gap-2">
                                <input
                                  placeholder="Txn ref (optional)"
                                  value={txnRefs[w.id] ?? ""}
                                  onChange={(e) =>
                                    setTxnRefs({ ...txnRefs, [w.id]: e.target.value })
                                  }
                                  className="flex-1 rounded-xl border border-night-line bg-night px-3.5 py-3 text-[13.5px] outline-none focus:border-mint/50"
                                />
                                <button
                                  disabled={busy === w.id}
                                  onClick={() =>
                                    act(w.id, "pay", { txnRef: txnRefs[w.id] ?? "" })
                                  }
                                  className="rounded-xl bg-mint px-5 text-[14px] font-medium text-night transition-colors hover:bg-mint/85 disabled:opacity-50"
                                >
                                  Mark paid
                                </button>
                              </div>
                            )}
                            {(w.status === "paid" || w.status === "rejected") && (
                              <p className="text-center text-[13px] text-white/40">
                                {w.status === "paid"
                                  ? `Transferred ${fmtDate(w.paidAt)}`
                                  : "Points returned to the referrer"}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Orders */}
        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-medium tracking-tight">Orders</h2>
              <p className="mt-1 text-[13.5px] text-white/45">
                Create an order for a client — paying it credits the referrer
                automatically.
              </p>
            </div>
            <button
              onClick={() => setOrderForm(!orderForm)}
              className="rounded-full bg-primary px-5 py-2.5 text-[14px] font-medium transition-colors hover:bg-primary-soft"
            >
              {orderForm ? "Cancel" : "+ New order"}
            </button>
          </div>

          {orderForm && (
            <form
              onSubmit={onCreateOrder}
              className="mt-5 grid gap-4 rounded-2xl border border-night-line bg-night-soft p-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              <input
                name="clientName"
                required
                placeholder="Client name"
                className="rounded-xl border border-night-line bg-night px-4 py-3 text-[14px] outline-none focus:border-primary/60"
              />
              <input
                name="clientEmail"
                required
                type="email"
                placeholder="Client email"
                className="rounded-xl border border-night-line bg-night px-4 py-3 text-[14px] outline-none focus:border-primary/60"
              />
              <input
                name="projectName"
                required
                placeholder="Project (e.g. E-commerce site)"
                className="rounded-xl border border-night-line bg-night px-4 py-3 text-[14px] outline-none focus:border-primary/60"
              />
              <div className="flex gap-3">
                <input
                  name="amountRs"
                  required
                  type="number"
                  min={100}
                  placeholder="Amount ₹"
                  className="w-full rounded-xl border border-night-line bg-night px-4 py-3 text-[14px] outline-none focus:border-primary/60"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-xl bg-primary px-5 text-[14px] font-medium transition-colors hover:bg-primary-soft"
                >
                  Create
                </button>
              </div>
            </form>
          )}

          <div className="mt-5 overflow-hidden rounded-2xl border border-night-line">
            {data.recentOrders.length === 0 ? (
              <p className="bg-night-soft p-8 text-center text-[14px] text-white/40">
                No orders yet.
              </p>
            ) : (
              data.recentOrders.map((o, i) => (
                <div
                  key={o.id}
                  className={`flex flex-wrap items-center gap-4 bg-night-soft px-5 py-4 ${
                    i > 0 ? "border-t border-night-line" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[14.5px] font-medium">{o.project_name}</p>
                    <p className="text-[12.5px] text-white/40">
                      {o.client_name} · {o.client_email} · {fmtDate(o.created_at)}
                    </p>
                  </div>
                  <span className="tabular text-[15px] font-medium">
                    ₹{inr(o.amount_rs)}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-[12px] font-medium ${O_STATUS[o.status]?.cls ?? ""}`}
                  >
                    {O_STATUS[o.status]?.label ?? o.status}
                  </span>
                  {o.status === "placed" && (
                    <button
                      disabled={busy === o.id}
                      onClick={() => onOrderAction(o.id, "pay")}
                      className="rounded-full bg-mint px-4 py-2 text-[12.5px] font-medium text-night transition-colors hover:bg-mint/85 disabled:opacity-50"
                    >
                      Mark paid
                    </button>
                  )}
                  {o.status === "paid" && (
                    <button
                      disabled={busy === o.id}
                      onClick={() => onOrderAction(o.id, "refund")}
                      className="rounded-full border border-ruby/40 px-4 py-2 text-[12.5px] font-medium text-ruby transition-colors hover:bg-ruby/10 disabled:opacity-50"
                    >
                      Refund
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Referrer summary */}
        <section className="mt-12">
          <h2 className="text-xl font-medium tracking-tight">
            Referrers — who brought how many
          </h2>
          <div className="mt-5 overflow-hidden rounded-2xl border border-night-line">
            {data.referralSummary.length === 0 ? (
              <p className="bg-night-soft p-8 text-center text-[14px] text-white/40">
                No active referrers yet.
              </p>
            ) : (
              data.referralSummary.map((r, i) => (
                <div
                  key={r.id}
                  className={`flex flex-wrap items-center gap-4 bg-night-soft px-5 py-4 ${
                    i > 0 ? "border-t border-night-line" : ""
                  }`}
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-magenta text-[13px] font-medium">
                    {r.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14.5px] font-medium">{r.name}</p>
                    <p className="text-[12.5px] text-white/40">{r.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="rounded-full bg-white/5 px-3 py-1 text-[12px] text-white/60">
                      {r.total} referred
                    </span>
                    <span className="rounded-full bg-mint/10 px-3 py-1 text-[12px] text-mint">
                      {r.paid} paid
                    </span>
                    <span className="rounded-full bg-amber-400/10 px-3 py-1 text-[12px] text-amber-300">
                      {r.pending} pending
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
