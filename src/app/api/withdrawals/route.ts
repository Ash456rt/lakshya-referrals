import { NextRequest, NextResponse } from "next/server";
import { db, pointsBalance, minWithdrawPoints } from "@/lib/db";
import { requireUser, withAuth } from "@/lib/auth";
import { notifyWithdrawalRequested } from "@/lib/email";

const BANK_RE = /^[A-Za-z0-9\s]{2,40}$/;
const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const ACCOUNT_RE = /^[0-9]{6,18}$/;

export const POST = withAuth(async (req: NextRequest) => {
  const user = await requireUser();

  let body: {
    points?: number;
    bankName?: string;
    accountHolder?: string;
    accountNo?: string;
    ifsc?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const min = minWithdrawPoints();
  const points = Number(body.points);
  if (!Number.isFinite(points) || points < min)
    return NextResponse.json(
      { error: `Minimum withdrawal is ${min} points` },
      { status: 400 }
    );
  if (points % 100 !== 0)
    return NextResponse.json(
      { error: "Withdraw in multiples of 100 points (₹25)" },
      { status: 400 }
    );

  const balance = pointsBalance(user.id);
  if (points > balance)
    return NextResponse.json(
      { error: "You don't have enough points" },
      { status: 400 }
    );

  const bankName = body.bankName?.trim() ?? "";
  const accountHolder = body.accountHolder?.trim() ?? "";
  const accountNo = body.accountNo?.trim() ?? "";
  const ifsc = body.ifsc?.trim().toUpperCase() ?? "";

  if (!BANK_RE.test(bankName))
    return NextResponse.json({ error: "Enter a valid bank name" }, { status: 400 });
  if (!BANK_RE.test(accountHolder))
    return NextResponse.json({ error: "Enter the account holder name" }, { status: 400 });
  if (!ACCOUNT_RE.test(accountNo))
    return NextResponse.json(
      { error: "Account number must be 6–18 digits" },
      { status: 400 }
    );
  if (!IFSC_RE.test(ifsc))
    return NextResponse.json(
      { error: "Enter a valid IFSC (e.g. HDFC0001234)" },
      { status: 400 }
    );

  const amountRs = Math.round(points / 4);
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);

  const tx = db.transaction(() => {
    // Deduct points immediately; refunded on rejection.
    db.prepare(
      "INSERT INTO points_ledger (user_id, points, reason, created_at) VALUES (?, ?, ?, ?)"
    ).run(user.id, -points, `Withdrawal request ₹${amountRs} (${points} pts)`, now);

    const info = db
      .prepare(
        `INSERT INTO withdrawals (user_id, points, amount_rs, bank_name, account_holder, account_no, ifsc, status, requested_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'requested', ?)`
      )
      .run(user.id, points, amountRs, bankName, accountHolder, accountNo, ifsc, now);
    return Number(info.lastInsertRowid);
  });

  const withdrawalId = tx();

  await notifyWithdrawalRequested({
    userName: user.name,
    amountRs,
    points,
    bankName,
    accountHolder,
    accountNo,
    ifsc,
    requestedAt: now,
  });

  return NextResponse.json({ ok: true, withdrawalId });
});

export const GET = withAuth(async () => {
  const user = await requireUser();
  const rows = db
    .prepare(
      `SELECT id, points, amount_rs, bank_name, status, txn_ref, notes, requested_at, paid_at
       FROM withdrawals WHERE user_id = ? ORDER BY id DESC`
    )
    .all(user.id);
  return NextResponse.json({ withdrawals: rows, balance: pointsBalance(user.id) });
});
