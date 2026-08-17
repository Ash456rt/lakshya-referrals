import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, withAuth } from "@/lib/auth";

export const POST = withAuth(async (req: NextRequest) => {
  await requireAdmin();

  let body: {
    clientEmail?: string;
    clientName?: string;
    projectName?: string;
    amountRs?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const clientEmail = body.clientEmail?.trim().toLowerCase();
  const clientName = body.clientName?.trim();
  const projectName = body.projectName?.trim();
  const amountRs = Number(body.amountRs);

  if (!clientEmail || !clientName || !projectName)
    return NextResponse.json(
      { error: "Client name, email and project name are required" },
      { status: 400 }
    );
  if (!Number.isFinite(amountRs) || amountRs < 100)
    return NextResponse.json(
      { error: "Amount must be at least ₹100" },
      { status: 400 }
    );

  const client = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(clientEmail) as { id: number } | undefined;

  const info = db
    .prepare(
      `INSERT INTO orders (user_id, client_name, client_email, project_name, amount_rs, status)
       VALUES (?, ?, ?, ?, ?, 'placed')`
    )
    .run(client?.id ?? null, clientName, clientEmail, projectName, amountRs);

  return NextResponse.json({ ok: true, orderId: Number(info.lastInsertRowid) });
});
