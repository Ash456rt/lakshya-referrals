import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, generateReferralCode } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";

// Minimal in-memory signup throttle (per process).
const attempts = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 10;

function throttle(ip: string): boolean {
  const now = Date.now();
  const list = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_PER_WINDOW) {
    attempts.set(ip, list);
    return false;
  }
  list.push(now);
  attempts.set(ip, list);
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (!throttle(ip)) {
    return NextResponse.json(
      { error: "Too many signups from this address. Try again later." },
      { status: 429 }
    );
  }

  let body: { name?: string; email?: string; phone?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const phone = body.phone?.trim() || null;
  const password = body.password ?? "";
  const signupIp = ip === "local" ? null : ip;

  if (!name || name.length < 2)
    return NextResponse.json({ error: "Enter your name" }, { status: 400 });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  if (password.length < 6)
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  if (db.prepare("SELECT 1 FROM users WHERE email = ?").get(email))
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );

  const code = generateReferralCode();
  const info = db
    .prepare(
      "INSERT INTO users (name, email, phone, password_hash, role, referral_code, signup_ip) VALUES (?, ?, ?, ?, 'user', ?, ?)"
    )
    .run(name, email, phone, hashPassword(password), code, signupIp);
  const userId = Number(info.lastInsertRowid);

  // Referral attribution: did they arrive via a referral link (90-day cookie)?
  const refCode = (await cookies()).get("lr_ref")?.value;
  if (refCode) {
    const referrer = db
      .prepare("SELECT id, signup_ip FROM users WHERE referral_code = ?")
      .get(refCode.toUpperCase()) as { id: number; signup_ip: string | null } | undefined;
    // Same device/IP signing up a second account to self-refer — block only when both IPs are known.
    const selfBlocked =
      !!referrer &&
      referrer.id !== userId &&
      !!referrer.signup_ip &&
      !!signupIp &&
      referrer.signup_ip === signupIp;
    if (referrer && referrer.id !== userId && !selfBlocked) {
      // One referral per person — don't re-attribute an email that's already claimed.
      const already = db
        .prepare(
          "SELECT 1 FROM referrals WHERE referred_email = ? AND referrer_id = ?"
        )
        .get(email, referrer.id);
      const claimedByOther = db
        .prepare("SELECT 1 FROM referrals WHERE referred_email = ? AND referrer_id != ?")
        .get(email, referrer.id);
      if (!already && !claimedByOther) {
        db.prepare(
          "INSERT INTO referrals (referrer_id, referred_name, referred_email, status, ref_code) VALUES (?, ?, ?, 'signed_up', ?)"
        ).run(referrer.id, name, email, refCode.toUpperCase());
      }
    }
  }

  await createSession(userId);
  return NextResponse.json({ ok: true, referralCode: code });
}
