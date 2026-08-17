import { redirect } from "next/navigation";
import type { Metadata } from "next";
import AuthForm from "@/components/auth/AuthForm";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign up — Lakshya Referrals" };

export default async function SignupPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-16">
      <div className="absolute inset-0 hero-glow" />
      <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(60%_60%_at_50%_30%,black,transparent)]" />

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-hairline bg-canvas/90 p-8 shadow-[0_24px_80px_rgba(13,37,61,0.12)] backdrop-blur md:p-10">
          <a href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-magenta text-white">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 3v18M12 3l-6 6M12 3l6 6"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="text-[15px] font-medium tracking-tight text-ink">
              Lakshya <span className="font-semibold text-primary">Referrals</span>
            </span>
          </a>

          <h1 className="display mt-8 text-3xl text-ink">Create your account</h1>
          <p className="mt-2 text-[14.5px] text-ink-mute">
            Get your referral link and start earning 10% on every project you
            bring in.
          </p>

          <div className="mt-7">
            <AuthForm mode="signup" />
          </div>

          <p className="mt-6 text-center text-[13.5px] text-ink-mute">
            Already have an account?{" "}
            <a href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
