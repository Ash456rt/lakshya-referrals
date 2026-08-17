import { NextResponse } from "next/server";
import { db, pointsBalance } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const referrals = db
    .prepare(
      `SELECT id, referred_name, referred_email, status, created_at
       FROM referrals WHERE referrer_id = ? ORDER BY id DESC`
    )
    .all(user.id);

  const ledger = db
    .prepare(
      `SELECT id, points, reason, created_at FROM points_ledger
       WHERE user_id = ? ORDER BY id DESC LIMIT 50`
    )
    .all(user.id);

  const withdrawals = db
    .prepare(
      `SELECT id, points, amount_rs, bank_name, status, txn_ref, notes, requested_at, paid_at
       FROM withdrawals WHERE user_id = ? ORDER BY id DESC`
    )
    .all(user.id);

  return NextResponse.json({
    user,
    balance: pointsBalance(user.id),
    referralLink: `${process.env.NEXT_PUBLIC_SITE_URL || "https://lakshyareferrals.in"}/?ref=${user.referral_code}`,
    referrals,
    ledger,
    withdrawals,
  });
}
