import { NextRequest, NextResponse } from "next/server";
import { db, cookieDays } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const upper = code.toUpperCase();

  const referrer = db
    .prepare("SELECT id FROM users WHERE referral_code = ?")
    .get(upper);

  const res = NextResponse.redirect(new URL("/", _req.url), 302);
  if (referrer) {
    res.cookies.set("lr_ref", upper, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: cookieDays() * 24 * 60 * 60,
    });
  }
  return res;
}
