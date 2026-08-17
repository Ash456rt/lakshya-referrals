import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  const user = db
    .prepare("SELECT id, password_hash, role FROM users WHERE email = ?")
    .get(email) as
    | { id: number; password_hash: string; role: string }
    | undefined;

  if (!user || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json(
      { error: "Wrong email or password" },
      { status: 401 }
    );
  }

  await createSession(user.id);
  return NextResponse.json({ ok: true, role: user.role });
}
