import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import bcrypt from "bcryptjs";

const DATA_DIR =
  process.env.DATA_DIR ??
  path.join(process.cwd(), process.env.NODE_ENV === "production" ? "data" : ".data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const globalForDb = globalThis as unknown as { __db?: Database.Database };

export const db =
  globalForDb.__db ?? new Database(path.join(DATA_DIR, "app.db"));

if (process.env.NODE_ENV !== "production") globalForDb.__db = db;

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

/* ---------------- Schema ---------------- */

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  phone         TEXT,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin','superadmin')),
  referral_code TEXT NOT NULL UNIQUE,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS referrals (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  referrer_id   INTEGER NOT NULL REFERENCES users(id),
  referred_name TEXT NOT NULL,
  referred_email TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'signed_up' CHECK (status IN ('signed_up','ordered','paid','refunded')),
  ref_code      TEXT,
  order_id      INTEGER,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER REFERENCES users(id),
  client_name   TEXT NOT NULL,
  client_email  TEXT NOT NULL,
  project_name  TEXT NOT NULL,
  amount_rs     INTEGER NOT NULL,
  status        TEXT NOT NULL DEFAULT 'placed' CHECK (status IN ('placed','paid','refunded')),
  referred_by_id INTEGER,
  paid_at       TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS points_ledger (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  order_id   INTEGER,
  points     INTEGER NOT NULL,
  reason     TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS withdrawals (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL REFERENCES users(id),
  points         INTEGER NOT NULL,
  amount_rs      INTEGER NOT NULL,
  bank_name      TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  account_no     TEXT NOT NULL,
  ifsc           TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','approved','paid','rejected')),
  txn_ref        TEXT,
  notes          TEXT,
  requested_at   TEXT NOT NULL DEFAULT (datetime('now')),
  paid_at        TEXT
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`);

// Migration: add signup_ip to users (fraud detection) if missing.
const userCols = (db.prepare("PRAGMA table_info(users)").all() as { name: string }[]).map(
  (c) => c.name
);
if (!userCols.includes("signup_ip")) {
  db.exec("ALTER TABLE users ADD COLUMN signup_ip TEXT");
}

/* ---------------- Defaults & seed ---------------- */

function setting(key: string, def: string) {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as
    | { value: string }
    | undefined;
  if (row) return row.value;
  db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)").run(key, def);
  return def;
}

export const COMMISSION_PCT = Number(setting("commission_pct", "10"));
export const POINTS_PER_RS = Number(setting("points_per_rupee", "4"));
export const MIN_WITHDRAW_POINTS = Number(setting("min_withdraw_points", "2000"));
export const COOKIE_DAYS = Number(setting("cookie_days", "90"));
export const ADMIN_EMAILS = setting("admin_emails", "").split(",").filter(Boolean);

/** Random 6-char referral code (letters + digits, no confusable chars). */
export function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  do {
    code = Array.from(
      { length: 6 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  } while (
    db.prepare("SELECT 1 FROM users WHERE referral_code = ?").get(code)
  );
  return code;
}

/** Balance = sum of ledger. */
export function pointsBalance(userId: number): number {
  const row = db
    .prepare(
      "SELECT COALESCE(SUM(points), 0) AS bal FROM points_ledger WHERE user_id = ?"
    )
    .get(userId) as { bal: number };
  return row.bal;
}

function seedIfEmpty() {
  // Race-safe: INSERT OR IGNORE so concurrent build workers can't double-seed.
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const insertUser = db.prepare(
    "INSERT OR IGNORE INTO users (name, email, password_hash, role, referral_code, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  );

  const adminPass = process.env.ADMIN_PASSWORD || "admin123";
  const adminEmail = process.env.ADMIN_EMAIL || "admin@lakshya.in";
  const adminChanges = insertUser.run(
    "Lakshya Admin",
    adminEmail,
    bcrypt.hashSync(adminPass, 10),
    "superadmin",
    generateReferralCode(),
    now
  ).changes;

  const demoChanges = insertUser.run(
    "Demo Referrer",
    "demo@example.com",
    bcrypt.hashSync("demo123", 10),
    "user",
    "DEMO01",
    now
  ).changes;

  const clientChanges = insertUser.run(
    "Demo Client",
    "client@example.com",
    bcrypt.hashSync("client123", 10),
    "user",
    "CLI001",
    now
  ).changes;

  // Demo data only when this process actually created the demo referrer.
  if (demoChanges === 0) return;

  const referrerId = (
    db.prepare("SELECT id FROM users WHERE email = ?").get("demo@example.com") as { id: number }
  ).id;
  const clientId = (
    db.prepare("SELECT id FROM users WHERE email = ?").get("client@example.com") as { id: number }
  ).id;

  db.prepare(
    "INSERT INTO referrals (referrer_id, referred_name, referred_email, status, ref_code, created_at) VALUES (?, ?, ?, 'paid', ?, ?)"
  ).run(referrerId, "Demo Client", "client@example.com", "DEMO01", now);
  const refId = (
    db.prepare("SELECT id FROM referrals WHERE referred_email = 'client@example.com'").get() as { id: number }
  ).id;

  db.prepare(
    "INSERT INTO orders (user_id, client_name, client_email, project_name, amount_rs, status, referred_by_id, paid_at, created_at) VALUES (?, ?, ?, ?, ?, 'paid', ?, ?, ?)"
  ).run(clientId, "Demo Client", "client@example.com", "College fest website", 5000, referrerId, now, now);
  const paidOrderId = (
    db.prepare("SELECT id FROM orders WHERE project_name = 'College fest website'").get() as { id: number }
  ).id;
  db.prepare("UPDATE referrals SET order_id = ? WHERE id = ?").run(paidOrderId, refId);
  db.prepare(
    "INSERT INTO points_ledger (user_id, order_id, points, reason, created_at) VALUES (?, ?, 2000, 'Commission 10% on College fest website (₹5000)', ?)"
  ).run(referrerId, paidOrderId, now);

  db.prepare(
    "INSERT INTO orders (user_id, client_name, client_email, project_name, amount_rs, status, referred_by_id, created_at) VALUES (?, ?, ?, ?, ?, 'placed', ?, ?)"
  ).run(clientId, "Demo Client", "client@example.com", "WhatsApp ordering bot", 4000, referrerId, now);

  // One withdrawal request (2,000 pts → ₹500) made 22h ago → shows the SLA clock mid-flight
  const reqTime = new Date(Date.now() - 22 * 60 * 60 * 1000)
    .toISOString()
    .replace("T", " ")
    .slice(0, 19);
  db.prepare(
    "INSERT INTO withdrawals (user_id, points, amount_rs, bank_name, account_holder, account_no, ifsc, status, requested_at) VALUES (?, 2000, 500, 'HDFC Bank', 'Demo Referrer', '50100234567890', 'HDFC0001234', 'requested', ?)"
  ).run(referrerId, reqTime);

  if (adminChanges > 0)
    console.log(`[db] Seeded superadmin (${adminEmail}) + demo data. Change ADMIN_PASSWORD in prod.`);
}

const seed = db.transaction(seedIfEmpty);
try {
  seed();
} catch (e) {
  console.error("[db] seed skipped:", (e as Error).message);
}

export { seedIfEmpty };
