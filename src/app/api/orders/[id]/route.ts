import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, withAuth } from "@/lib/auth";
import { payOrderAndCredit, refundOrder } from "@/lib/points";
import { notifyPointsCredited } from "@/lib/email";

export const PATCH = withAuth(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    await requireAdmin();
    const { id } = await params;
    const orderId = Number(id);

    let body: { action?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (body.action === "pay") {
      try {
        const credited = payOrderAndCredit(orderId);
        if (credited) {
          const referrer = db
            .prepare("SELECT email FROM users WHERE id = ?")
            .get(credited.referrerId) as { email: string };
          const order = db
            .prepare("SELECT project_name FROM orders WHERE id = ?")
            .get(orderId) as { project_name: string };
          await notifyPointsCredited(referrer.email, credited.points, order.project_name);
        }
        return NextResponse.json({ ok: true, credited });
      } catch (e) {
        return NextResponse.json(
          { error: (e as Error).message },
          { status: 400 }
        );
      }
    }

    if (body.action === "refund") {
      refundOrder(orderId);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
);
