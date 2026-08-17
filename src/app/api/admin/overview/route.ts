import { NextResponse } from "next/server";
import { db, adminEmails } from "@/lib/db";
import { requireAdmin, withAuth } from "@/lib/auth";
import { hoursSince } from "@/lib/format";

export const GET = withAuth(async () => {
  await requireAdmin();

  const stats = {
    totalUsers: (
      db.prepare("SELECT COUNT(*) AS c FROM users WHERE role = 'user'").get() as { c: number }
    ).c,
    totalReferrals: (
      db.prepare("SELECT COUNT(*) AS c FROM referrals").get() as { c: number }
    ).c,
    paidReferrals: (
      db.prepare("SELECT COUNT(*) AS c FROM referrals WHERE status = 'paid'").get() as { c: number }
    ).c,
    paidOutRs: (
      db
        .prepare("SELECT COALESCE(SUM(amount_rs), 0) AS s FROM withdrawals WHERE status = 'paid'")
        .get() as { s: number }
    ).s,
    pendingWithdrawals: (
      db
        .prepare("SELECT COUNT(*) AS c FROM withdrawals WHERE status IN ('requested','approved')")
        .get() as { c: number }
    ).c,
    pendingValueRs: (
      db
        .prepare(
          "SELECT COALESCE(SUM(amount_rs), 0) AS s FROM withdrawals WHERE status IN ('requested','approved')"
        )
        .get() as { s: number }
    ).s,
  };

  // Fraud flags: duplicate bank details across users / multiple accounts per user.
  const flaggedRows = db
    .prepare(
      `SELECT w.id,
         (SELECT COUNT(*) FROM withdrawals w2
           WHERE w2.account_no = w.account_no AND w2.ifsc = w.ifsc
             AND w2.user_id != w.user_id AND w2.status IN ('requested','approved','paid')) AS dup_account,
         (SELECT COUNT(DISTINCT w3.account_no) FROM withdrawals w3
           WHERE w3.user_id = w.user_id AND w3.account_no != w.account_no) AS dup_user_account
       FROM withdrawals w`
    )
    .all() as { id: number; dup_account: number; dup_user_account: number }[];
  const flaggedWithdrawals = new Map<number, { dupAccount: boolean; dupUserAccount: boolean }>();
  for (const f of flaggedRows) {
    flaggedWithdrawals.set(f.id, {
      dupAccount: f.dup_account > 0,
      dupUserAccount: f.dup_user_account > 0,
    });
  }

  const withdrawals = db
    .prepare(
      `SELECT w.*, u.name AS user_name, u.email AS user_email
       FROM withdrawals w JOIN users u ON u.id = w.user_id
       ORDER BY
         CASE w.status WHEN 'requested' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END,
         w.requested_at DESC`
    )
    .all()
    .map((r) => {
      const row = r as typeof r & {
        id: number;
        user_name: string;
        user_email: string;
        points: number;
        amount_rs: number;
        bank_name: string;
        account_holder: string;
        account_no: string;
        ifsc: string;
        status: string;
        txn_ref: string | null;
        notes: string | null;
        requested_at: string;
        paid_at: string | null;
      };
      return {
        id: row.id,
        userName: row.user_name,
        userEmail: row.user_email,
        points: row.points,
        amountRs: row.amount_rs,
        bankName: row.bank_name,
        accountHolder: row.account_holder,
        accountNo: row.account_no,
        ifsc: row.ifsc,
        status: row.status,
        txnRef: row.txn_ref,
        notes: row.notes,
        requestedAt: row.requested_at,
        paidAt: row.paid_at,
        slaHours: hoursSince(row.requested_at),
        ...(flaggedWithdrawals.get(row.id) ?? { dupAccount: false, dupUserAccount: false }),
      };
    });

  // IP clusters: 3+ referred users signing up from the same IP is suspicious.
  const clusters = db
    .prepare(
      `SELECT u.signup_ip AS ip, COUNT(*) AS count, GROUP_CONCAT(r.referred_email, ', ') AS emails
       FROM referrals r
       JOIN users u ON u.email = r.referred_email
       WHERE u.signup_ip IS NOT NULL
       GROUP BY u.signup_ip
       HAVING count >= 3
       ORDER BY count DESC`
    )
    .all() as { ip: string; count: number; emails: string }[];

  // Per-referrer summary (how many people each referrer brought in).
  const referralSummary = db
    .prepare(
      `SELECT u.id, u.name, u.email,
              COUNT(r.id) AS total,
              SUM(CASE WHEN r.status = 'paid' THEN 1 ELSE 0 END) AS paid,
              SUM(CASE WHEN r.status IN ('signed_up','ordered') THEN 1 ELSE 0 END) AS pending
       FROM users u
       LEFT JOIN referrals r ON r.referrer_id = u.id
       WHERE u.role = 'user'
       GROUP BY u.id
       HAVING total > 0
       ORDER BY total DESC`
    )
    .all();

  const recentOrders = db
    .prepare("SELECT * FROM orders ORDER BY id DESC LIMIT 20")
    .all();

  return NextResponse.json({
    stats,
    withdrawals,
    referralSummary,
    recentOrders,
    adminEmails: adminEmails(),
    fraud: { clusters },
  });
});
