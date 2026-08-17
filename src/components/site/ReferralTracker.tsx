"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Captures ?ref=CODE from the URL, stores it as the 90-day attribution cookie
 * (fallback for visitors landing on the homepage directly rather than /r/CODE),
 * and shows a subtle "you were referred" banner.
 */
export default function ReferralTracker() {
  const params = useSearchParams();
  const [referredBy, setReferredBy] = useState<string | null>(null);

  useEffect(() => {
    const code = params.get("ref")?.trim().toUpperCase();
    if (!code) return;

    try {
      document.cookie = `lr_ref=${code}; path=/; max-age=${90 * 24 * 60 * 60}; samesite=lax`;
    } catch {
      /* ignore */
    }
    setReferredBy(code);
    // Clean the ?ref= out of the URL so it isn't re-shared.
    window.history.replaceState({}, "", window.location.pathname);
  }, [params]);

  if (!referredBy) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-full border border-primary/25 bg-canvas/95 py-2.5 pr-4 pl-5 shadow-[0_12px_40px_rgba(13,37,61,0.18)] backdrop-blur">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-primary-tint text-primary">
          🎉
        </span>
        <p className="text-[13.5px] text-ink">
          You were referred by{" "}
          <span className="font-semibold text-primary">{referredBy}</span>
        </p>
        <a
          href="/signup"
          className="rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-white hover:bg-primary-deep"
        >
          Sign up
        </a>
      </div>
    </div>
  );
}
