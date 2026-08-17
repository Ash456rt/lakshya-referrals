import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lakshya Referrals — Earn 10% on every project you refer",
  description:
    "Refer a friend who needs a project built. Earn a 10% commission as points, withdraw ₹500+ to your bank within 24 hours.",
  keywords: [
    "referral program",
    "earn commission",
    "Lakshya Academy",
    "project referrals",
    "earn money online",
  ],
  openGraph: {
    title: "Lakshya Referrals — Earn 10% on every project you refer",
    description:
      "Share your link, earn 10% commission on every project your referrals get built. Withdraw ₹500+ within 24 hours.",
    type: "website",
  },
};

// Apply the saved/system theme before first paint to avoid a flash.
const themeScript = `
(function () {
  try {
    var t = localStorage.getItem("lr-theme");
    var dark = t === "dark" || (!t && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-canvas text-ink">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
