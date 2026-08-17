import { db, COMMISSION_PCT, POINTS_PER_RS } from "@/lib/db";

export function commissionFor(amountRs: number): number {
  return Math.round((amountRs * COMMISSION_PCT) / 100);
}

export function pointsFor(amountRs: number): number {
  return commissionFor(amountRs) * POINTS_PER_RS;
}

/**
 * Mark an order paid and credit the referrer's points.
 * Returns { referrerId, points } or null when no referrer is attached.
 */
export function payOrderAndCredit(orderId: number): { referrerId: number; points: number } | null {
  const order = db
    .prepare("SELECT * FROM orders WHERE id = ?")
    .get(orderId) as
    | {
        id: number;
        user_id: number | null;
        client_email: string;
        project_name: string;
        amount_rs: number;
        status: string;
      }
    | undefined;
  if (!order) throw new Error("Order not found");
  if (order.status === "paid") return null;

  const now = new Date().toISOString().replace("T", " ").slice(0, 19);

  // Find the referral that brought this client in.
  const referral = db
    .prepare(
      "SELECT id, referrer_id FROM referrals WHERE referred_email = ? AND status IN ('signed_up','ordered') ORDER BY id LIMIT 1"
    )
    .get(order.client_email) as { id: number; referrer_id: number } | undefined;

  db.prepare("UPDATE orders SET status = 'paid', paid_at = ? WHERE id = ?").run(now, orderId);

  if (!referral) return null;

  const points = pointsFor(order.amount_rs);
  db.prepare(
    "INSERT INTO points_ledger (user_id, order_id, points, reason, created_at) VALUES (?, ?, ?, ?, ?)"
  ).run(
    referral.referrer_id,
    orderId,
    points,
    `Commission ${COMMISSION_PCT}% on ${order.project_name} (₹${order.amount_rs})`,
    now
  );
  db.prepare("UPDATE referrals SET status = 'paid', order_id = ? WHERE id = ?").run(
    orderId,
    referral.id
  );
  db.prepare("UPDATE orders SET referred_by_id = ? WHERE id = ?").run(
    referral.referrer_id,
    orderId
  );

  return { referrerId: referral.referrer_id, points };
}

/** Refund: claw back commission points if the order was paid with credit. */
export function refundOrder(orderId: number) {
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId) as
    | { status: string; amount_rs: number; project_name: string }
    | undefined;
  if (!order || order.status !== "paid") return;

  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const credit = db
    .prepare("SELECT id, user_id, points FROM points_ledger WHERE order_id = ? AND points > 0")
    .get(orderId) as { id: number; user_id: number; points: number } | undefined;

  db.prepare("UPDATE orders SET status = 'refunded' WHERE id = ?").run(orderId);
  if (credit) {
    db.prepare(
      "INSERT INTO points_ledger (user_id, order_id, points, reason, created_at) VALUES (?, ?, ?, ?, ?)"
    ).run(
      credit.user_id,
      orderId,
      -credit.points,
      `Refund clawback on ${order.project_name} (₹${order.amount_rs})`,
      now
    );
    db.prepare(
      "UPDATE referrals SET status = 'refunded' WHERE order_id = ?"
    ).run(orderId);
  }
}
