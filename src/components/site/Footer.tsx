export default function Footer() {
  return (
    <footer className="border-t border-hairline bg-canvas">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
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
            </div>
            <p className="mt-4 text-[13.5px] leading-relaxed text-ink-mute">
              The referral program for Lakshya Academy — earn 10% commission on
              every project you bring in.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-mute">
                Program
              </p>
              <ul className="mt-4 space-y-2.5 text-[14px] text-ink-secondary">
                <li><a href="#how-it-works" className="hover:text-primary">How it works</a></li>
                <li><a href="#calculator" className="hover:text-primary">Calculator</a></li>
                <li><a href="#features" className="hover:text-primary">Features</a></li>
                <li><a href="#faq" className="hover:text-primary">FAQ</a></li>
              </ul>
            </div>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-mute">
                Company
              </p>
              <ul className="mt-4 space-y-2.5 text-[14px] text-ink-secondary">
                <li><a href="#top" className="hover:text-primary">Lakshya Academy</a></li>
                <li><a href="#top" className="hover:text-primary">Projects we build</a></li>
                <li><a href="#top" className="hover:text-primary">Contact us</a></li>
              </ul>
            </div>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-mute">
                Support
              </p>
              <ul className="mt-4 space-y-2.5 text-[14px] text-ink-secondary">
                <li><a href="#top" className="hover:text-primary">WhatsApp support</a></li>
                <li><a href="#top" className="hover:text-primary">hello@lakshya.in</a></li>
                <li><a href="#top" className="hover:text-primary">Terms & payouts</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-hairline pt-6 text-[12.5px] text-ink-mute md:flex-row">
          <p>© {new Date().getFullYear()} Lakshya Referrals. Made in India 🇮🇳</p>
          <p className="tabular">
            4 points = ₹1 · Minimum withdrawal 2,000 points (₹500) · Paid within 24 hours
          </p>
        </div>
      </div>
    </footer>
  );
}
