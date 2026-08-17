import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, withAuth } from "@/lib/auth";
import { notifyWithdrawalPaid, notifyWithdrawalRejected } from "@/lib/email";

export const PATCH = withAuth(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    await requireAdmin();
    const { id } = await params;
    const w = db
      .prepare("SELECT * FROM withdrawals WHERE id = ?")
      .get(Number(id)) as
      | {
          id: number;
          user_id: number;
          points: number;
          amount_rs: number;
          status: string;
        }
      | undefined;
    if (!w) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let body: { action?: string; txnRef?: string; notes?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    const userEmail = (
      db.prepare("SELECT email FROM users WHERE id = ?").get(w.user_id) as { email: string }
    ).email;

    switch (body.action) {
      case "approve": {
        if (w.status !== "requested")
          return NextResponse.json(
            { error: `Cannot approve a ${w.status} request` },
            { status: 400 }
          );
        db.prepare("UPDATE withdrawals SET status = 'approved' WHERE id = ?").run(w.id);
        return NextResponse.json({ ok: true });
      }
      case "pay": {
        if (w.status !== "approved" && w.status !== "requested")
          return NextResponse.json(
            { error: `Cannot pay a ${w.status} request` },
            { status: 400 }
          );
        db.prepare(
          "UPDATE withdrawals SET status = 'paid', txn_ref = ?, paid_at = ? WHERE id = ?"
        ).run(body.txnRef?.trim() || null, now, w.id);
        await notifyWithdrawalPaid(userEmail, w.amount_rs);
        return NextResponse.json({ ok: true });
      }
      case "reject": {
        if (w.status === "paid")
          return NextResponse.json(
            { error: "Cannot reject an already-paid request" },
            { status: 400 }
          );
        const notes = body.notes?.trim() || "Bank details could not be verified";
        db.prepare(
          "UPDATE withdrawals SET status = 'rejected', notes = ? WHERE id = ?"
        ).run(notes, w.id);
        // Return the points to the user's balance.
        db.prepare(
          "INSERT INTO points_ledger (user_id, points, reason, created_at) VALUES (?, ?, ?, ?)"
        ).run(w.user_id, w.points, `Withdrawal ${w.id} rejected — points returned`, now);
        await notifyWithdrawalRejected(userEmail, w.amount_rs, notes);
        return NextResponse.json({ ok: true });
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  }
);
