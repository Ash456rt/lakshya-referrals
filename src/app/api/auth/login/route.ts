import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { clientIp, rateLimited } from "@/lib/rate-limit";

const LOGIN_LIMIT = 30;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (rateLimited(ip, LOGIN_LIMIT, LOGIN_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }

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
