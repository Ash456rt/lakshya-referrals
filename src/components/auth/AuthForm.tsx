"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AuthForm({ mode }: { mode: "signup" | "login" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const body: Record<string, string> = {
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
    };
    if (isSignup) {
      body.name = String(fd.get("name") ?? "");
      body.phone = String(fd.get("phone") ?? "");
    }

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      // New signups are always regular users; logins redirect by role.
      const dest = mode === "signup" ? "/dashboard" : data.role === "user" ? "/dashboard" : "/admin";
      router.push(dest);
      router.refresh();
    } catch {
      setError("Network error — try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {isSignup && (
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm text-ink-secondary">
            Full name
          </label>
          <input
            id="name"
            name="name"
            required
            minLength={2}
            placeholder="Your name"
            className="w-full rounded-xl border border-hairline bg-canvas px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-mute/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm text-ink-secondary">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-xl border border-hairline bg-canvas px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-mute/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
        />
      </div>

      {isSignup && (
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm text-ink-secondary">
            Phone <span className="text-ink-mute">(optional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            pattern="[0-9+ ]{10,15}"
            placeholder="+91 98765 43210"
            className="w-full rounded-xl border border-hairline bg-canvas px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-mute/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
          />
        </div>
      )}

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm text-ink-secondary">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          placeholder={isSignup ? "At least 6 characters" : "Your password"}
          className="w-full rounded-xl border border-hairline bg-canvas px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-mute/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
        />
      </div>

      {error && (
        <p className="rounded-xl bg-ruby/8 px-4 py-3 text-[13.5px] text-ruby">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-primary py-3.5 text-[15px] font-medium text-white shadow-[0_4px_20px_rgba(83,58,253,0.3)] transition-colors hover:bg-primary-deep disabled:opacity-60"
      >
        {loading ? "Please wait…" : isSignup ? "Create my account" : "Sign in"}
      </button>
    </form>
  );
}
