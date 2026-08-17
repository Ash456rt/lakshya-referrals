import { NextRequest, NextResponse } from "next/server";
import { db, getSetting } from "@/lib/db";
import { requireAdmin, withAuth } from "@/lib/auth";

export const GET = withAuth(async () => {
  await requireAdmin();
  return NextResponse.json({
    commissionPct: Number(getSetting("commission_pct", "10")),
    pointsPerRs: Number(getSetting("points_per_rupee", "4")),
    minWithdrawPoints: Number(getSetting("min_withdraw_points", "2000")),
    cookieDays: Number(getSetting("cookie_days", "90")),
    adminEmails: getSetting("admin_emails", ""),
  });
});

export const PUT = withAuth(async (req: NextRequest) => {
  await requireAdmin();

  let body: {
    commissionPct?: number;
    pointsPerRs?: number;
    minWithdrawPoints?: number;
    cookieDays?: number;
    adminEmails?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const set = db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  );

  if (body.commissionPct !== undefined) {
    const v = Number(body.commissionPct);
    if (!Number.isFinite(v) || v < 1 || v > 50)
      return NextResponse.json(
        { error: "Commission must be between 1% and 50%" },
        { status: 400 }
      );
    set.run("commission_pct", String(v));
  }

  if (body.pointsPerRs !== undefined) {
    const v = Number(body.pointsPerRs);
    if (!Number.isFinite(v) || v < 1 || v > 100)
      return NextResponse.json(
        { error: "Points per ₹ must be between 1 and 100" },
        { status: 400 }
      );
    set.run("points_per_rupee", String(v));
  }

  if (body.minWithdrawPoints !== undefined) {
    const v = Number(body.minWithdrawPoints);
    if (!Number.isFinite(v) || v < 100 || v > 1_000_000)
      return NextResponse.json(
        { error: "Minimum withdrawal must be between 100 and 1,000,000 points" },
        { status: 400 }
      );
    set.run("min_withdraw_points", String(v));
  }

  if (body.cookieDays !== undefined) {
    const v = Number(body.cookieDays);
    if (!Number.isFinite(v) || v < 1 || v > 365)
      return NextResponse.json(
        { error: "Cookie lifetime must be between 1 and 365 days" },
        { status: 400 }
      );
    set.run("cookie_days", String(v));
  }

  if (body.adminEmails !== undefined) {
    const emails = body.adminEmails
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    if (!emails.every((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)))
      return NextResponse.json({ error: "Invalid email in admin list" }, { status: 400 });
    set.run("admin_emails", emails.join(","));
  }

  return NextResponse.json({ ok: true });
});
