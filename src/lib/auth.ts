import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SESSION_COOKIE = "lr_session";
const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "lakshya-referrals-dev-secret-change-me"
);
const SESSION_DAYS = 30;

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  referral_code: string;
};

function toSessionUser(row: {
  id: number;
  name: string;
  email: string;
  role: string;
  referral_code: string;
}): SessionUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    referral_code: row.referral_code,
  };
}

export async function createSession(userId: number) {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(SECRET);

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession() {
  (await cookies()).set(SESSION_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
}

async function verify(token: string): Promise<number | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return typeof payload.uid === "number" ? payload.uid : null;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const uid = await verify(token);
  if (!uid) return null;
  const row = db
    .prepare(
      "SELECT id, name, email, role, referral_code FROM users WHERE id = ?"
    )
    .get(uid) as
    | { id: number; name: string; email: string; role: string; referral_code: string }
    | undefined;
  return row ? toSessionUser(row) : null;
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) throw new AuthError("Not signed in", 401);
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) throw new AuthError("Not signed in", 401);
  if (user.role !== "admin" && user.role !== "superadmin")
    throw new AuthError("Admins only", 403);
  return user;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Wraps an API route handler so auth failures return proper 401/403 JSON
 * instead of an uncaught 500.
 */
export function withAuth<T extends unknown[]>(fn: (...args: T) => Promise<NextResponse>) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await fn(...args);
    } catch (e) {
      if (e instanceof AuthError)
        return NextResponse.json({ error: e.message }, { status: e.status });
      console.error("[api]", e);
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
  };
}

export function hashPassword(pw: string) {
  return bcrypt.hashSync(pw, 10);
}

export function verifyPassword(pw: string, hash: string) {
  return bcrypt.compareSync(pw, hash);
}

/** Read ref code from the incoming request's cookie (API routes). */
export function refCodeFromRequest(req: NextRequest): string | null {
  return req.cookies.get("lr_ref")?.value ?? null;
}
