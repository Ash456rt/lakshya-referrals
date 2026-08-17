export function inr(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

export function fmtDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso.includes("T") ? iso : iso.replace(" ", "T") + "Z");
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Hours since a timestamp — used by the 24h SLA clock. */
export function hoursSince(iso: string | null): number {
  if (!iso) return 0;
  const t = new Date(iso.includes("T") ? iso : iso.replace(" ", "T") + "Z").getTime();
  return (Date.now() - t) / 3_600_000;
}

export function slaLabel(iso: string): { text: string; overdue: boolean } {
  const h = hoursSince(iso);
  if (h <= 0.1) return { text: "just now", overdue: false };
  const mins = Math.round(h * 60);
  if (mins < 60) return { text: `${mins}m ago · ${24 * 60 - mins}m left`, overdue: false };
  const hrs = Math.floor(h);
  const left = Math.round(24 - h);
  if (left <= 0) return { text: `${hrs}h ago · OVERDUE`, overdue: true };
  return { text: `${hrs}h ago · ${left}h left`, overdue: false };
}
