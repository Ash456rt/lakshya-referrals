/**
 * Visual check — drives the Helium browser (Chromium) headless against
 * http://localhost:3111, captures console errors / failed requests /
 * horizontal overflow, logs into demo accounts, and screenshots every page.
 *
 * Run:  node scripts/visual-check.mjs
 */
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const HELIUM = join(
  process.env.LOCALAPPDATA,
  "imput",
  "Helium",
  "Application",
  "chrome.exe"
);
const BASE = "http://localhost:3111";
const OUT = join(fileURLToPath(new URL(".", import.meta.url)), "..", "screenshots");
mkdirSync(OUT, { recursive: true });

const problems = [];
const consoleErrors = [];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: HELIUM,
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu", "--window-size=1440,900"],
  defaultViewport: { width: 1440, height: 900 },
});

async function newPage(name) {
  const page = await browser.newPage();
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(`[${name}] ${m.text()}`);
  });
  page.on("pageerror", (e) => consoleErrors.push(`[${name}] pageerror: ${e.message}`));
  page.on("requestfailed", (r) =>
    problems.push(`[${name}] request failed: ${r.url()} — ${r.failure()?.errorText}`)
  );
  return page;
}

async function checkOverflow(page, name) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  if (overflow > 0) problems.push(`[${name}] HORIZONTAL OVERFLOW of ${overflow}px`);
}

async function shot(page, name, file) {
  await page.screenshot({ path: join(OUT, file), fullPage: true });
  console.log(`  📸 ${file}`);
}

async function login(page, email, password) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle0" });
  await page.type('input[name="email"]', email);
  await page.type('input[name="password"]', password);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    page.click('button[type="submit"]'),
  ]);
}

// ---------- 1. Landing (light) ----------
{
  const page = await newPage("landing");
  await page.goto(BASE, { waitUntil: "networkidle0" });
  await sleep(2500); // let Aurora + headline animations settle
  await checkOverflow(page, "landing");
  await shot(page, "landing", "01-landing.png");
  await page.close();
}

// ---------- 1b. Landing (dark mode) ----------
{
  const page = await newPage("landing-dark");
  await page.goto(BASE, { waitUntil: "networkidle0" });
  await page.evaluate(() => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("lr-theme", "dark");
  });
  await sleep(1800);
  await checkOverflow(page, "landing-dark");
  await shot(page, "landing-dark", "01b-landing-dark.png");
  await page.close();
}

// ---------- 2. Referral link page (cookie attribution) ----------
{
  const page = await newPage("ref-link");
  await page.goto(`${BASE}/r/DEMO01`, { waitUntil: "networkidle0" });
  const landed = page.url();
  const cookie = (await page.cookies()).find((c) => c.name === "lr_ref");
  console.log(`  /r/DEMO01 → ${landed} | cookie: ${cookie?.value ?? "MISSING"}`);
  await page.close();
}

// ---------- 3. Signup ----------
{
  const page = await newPage("signup");
  await page.goto(`${BASE}/signup`, { waitUntil: "networkidle0" });
  await checkOverflow(page, "signup");
  await shot(page, "signup", "02-signup.png");
  await page.close();
}

// ---------- 4. Referrer dashboard ----------
{
  const page = await newPage("dashboard");
  await login(page, "demo@example.com", "demo123");
  await checkOverflow(page, "dashboard");
  await shot(page, "dashboard", "03-dashboard.png");
  // Switch to the Withdraw tab
  await page.evaluate(() => {
    [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Withdraw")?.click();
  });
  await sleep(600);
  await shot(page, "withdraw-tab", "04-withdraw-tab.png");
  await page.close();
}

// ---------- 5. Admin dashboard (fresh incognito context — no demo session) ----------
{
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(`[admin] ${m.text()}`);
  });
  page.on("pageerror", (e) => consoleErrors.push(`[admin] pageerror: ${e.message}`));
  await login(page, "admin@lakshya.in", "admin123");
  await checkOverflow(page, "admin");
  await shot(page, "admin", "05-admin.png");
  // Expand the first withdrawal row
  const expanded = await page.evaluate(() => {
    const queue = [...document.querySelectorAll("section")].find((s) =>
      s.textContent.includes("Withdrawal queue")
    );
    const btn = queue?.querySelector("button");
    if (!btn) return false;
    btn.click();
    return true;
  });
  await sleep(600);
  if (expanded) await shot(page, "admin-expanded", "06-admin-withdrawal-detail.png");
  await ctx.close();
}

await browser.close();

console.log("\n───────── RESULTS ─────────");
console.log(`Console errors: ${consoleErrors.length}`);
consoleErrors.slice(0, 20).forEach((e) => console.log("  ⚠️ " + e));
console.log(`Other problems: ${problems.length}`);
problems.slice(0, 20).forEach((p) => console.log("  ⚠️ " + p));
console.log(`Screenshots saved to: ${OUT}`);
process.exit(consoleErrors.length || problems.length ? 1 : 0);
