// E2E fraud-detection test. Requires the server running on :3111 with a FRESH DB.
// Run:  node scripts/fraud-test.mjs
const BASE = "http://localhost:3111";

let pass = 0, fail = 0;
const ok = (m) => { console.log("  ✅ " + m); pass++; };
const bad = (m) => { console.log("  ❌ " + m); fail++; };

// ---- tiny cookie jar ----
const jars = new Map();
const jar = (n) => (jars.get(n) ?? jars.set(n, new Map()).get(n));
const cookieHeader = (n) =>
  [...jar(n).entries()].map(([k, v]) => `${k}=${v}`).join("; ");
const storeCookies = (n, res) => {
  const setCookies = res.headers.getSetCookie?.() ?? [];
  for (const c of setCookies) {
    const [pair] = c.split(";");
    const eq = pair.indexOf("=");
    if (eq > 0) jar(n).set(pair.slice(0, eq), pair.slice(eq + 1));
  }
};

async function api(path, { method = "GET", body, jarName, cookie, ip } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (ip) headers["X-Forwarded-For"] = ip;
  const c = cookie ?? (jarName ? cookieHeader(jarName) : "");
  if (c) headers["Cookie"] = c;
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (jarName) storeCookies(jarName, res);
  let data = null;
  try { data = await res.json(); } catch {}
  return { status: res.status, data };
}

const signup = (name, email, ip, cookie, jarName) =>
  api("/api/auth/register", {
    method: "POST",
    body: { name, email, password: "secret123" },
    ip,
    cookie,
    jarName,
  });

const login = (email, jarName, password = "secret123") =>
  api("/api/auth/login", {
    method: "POST",
    body: { email, password },
    jarName,
  });

async function referralsOf(email) {
  await login(email, "me-" + email);
  const r = await api("/api/me", { jarName: "me-" + email });
  return r.data.referrals.length;
}

async function balanceOf(email) {
  await login(email, "me-" + email);
  const r = await api("/api/me", { jarName: "me-" + email });
  return r.data.balance;
}

async function withdraw(email, points, account) {
  await login(email, "w-" + email);
  return api("/api/withdrawals", {
    method: "POST",
    jarName: "w-" + email,
    body: {
      points,
      bankName: "HDFC Bank",
      accountHolder: "Test Holder",
      accountNo: account,
      ifsc: "HDFC0001234",
    },
  });
}

// ────────────────────────────────
console.log("── 1. Referrer A signs up (IP 1.1.1.1) ──");
const a = await signup("Referrer A", "refera@example.com", "1.1.1.1", undefined, "a");
const codeA = a.data?.referralCode;
if (codeA) ok(`A created with code ${codeA}`); else bad(`A signup: ${a.status} ${JSON.stringify(a.data)}`);

const refCookie = `lr_ref=${codeA}`;

console.log("── 2. Self-referral: B signs up via A's link from SAME IP → blocked ──");
await signup("Self Ref", "selfref@example.com", "1.1.1.1", refCookie, "b");
const n2 = await referralsOf("refera@example.com");
n2 === 0 ? ok("no referral recorded (same IP blocked)") : bad(`expected 0, got ${n2}`);

console.log("── 3. Legit referral: C signs up via A's link from DIFFERENT IP → attributed ──");
await signup("Client C", "clientc@example.com", "2.2.2.2", refCookie, "c");
const n3 = await referralsOf("refera@example.com");
n3 === 1 ? ok("referral recorded for C") : bad(`expected 1, got ${n3}`);

console.log("── 4. Dedupe: same email re-registered → no double attribution ──");
await signup("Client C Dup", "clientc@example.com", "3.3.3.3", refCookie, "c2");
const n4 = await referralsOf("refera@example.com");
n4 === 1 ? ok("no duplicate referral") : bad(`expected still 1, got ${n4}`);

console.log("── 5. Commission: admin pays C's order → A earns 2000 pts ──");
const adminLogin = await login("admin@lakshya.in", "admin", "admin123");
if (![...jar("admin").keys()].includes("lr_session"))
  bad(`admin session cookie not stored (login ${adminLogin.status})`);
const order = await api("/api/orders", {
  method: "POST",
  jarName: "admin",
  body: { clientEmail: "clientc@example.com", clientName: "Client C", projectName: "Landing page", amountRs: 5000 },
});
const pay = await api(`/api/orders/${order.data.orderId}`, {
  method: "PATCH",
  jarName: "admin",
  body: { action: "pay" },
});
const bal = await balanceOf("refera@example.com");
pay.data?.credited?.points === 2000 && bal === 2000
  ? ok("A has exactly 2000 pts")
  : bad(`expected 2000 pts, got ${bal} (credit: ${JSON.stringify(pay.data)})`);

console.log("── 6. Duplicate bank account: A and E withdraw to the SAME account ──");
// E signs up, refers a client, and earns points too.
const e = await signup("Referrer E", "refere@example.com", "4.4.4.4", undefined, "e");
const codeE = e.data?.referralCode;
await signup("Client EC", "clientec@example.com", "5.5.5.5", `lr_ref=${codeE}`, "ec");
const oE = await api("/api/orders", {
  method: "POST", jarName: "admin",
  body: { clientEmail: "clientec@example.com", clientName: "Client EC", projectName: "Portfolio", amountRs: 5000 },
});
await api(`/api/orders/${oE.data.orderId}`, { method: "PATCH", jarName: "admin", body: { action: "pay" } });
const wA = await withdraw("refera@example.com", 2000, "50100234567890");
const wE = await withdraw("refere@example.com", 2000, "50100234567890");
if (!wA.data?.ok) bad(`A withdraw: ${wA.status} ${JSON.stringify(wA.data)}`);
if (!wE.data?.ok) bad(`E withdraw: ${wE.status} ${JSON.stringify(wE.data)}`);
const ov1 = await api("/api/admin/overview", { jarName: "admin" });
const dupCount = ov1.data.withdrawals.filter((w) => w.dupAccount).length;
dupCount >= 1 ? ok(`duplicate bank account flagged (${dupCount})`) : bad("expected dupAccount flag, got none");

console.log("── 7. IP cluster: F, G, H sign up via A's link from 9.9.9.9 ──");
for (const x of ["f", "g", "h"])
  await signup(`Cluster ${x.toUpperCase()}`, `cluster${x}@example.com`, "9.9.9.9", refCookie, x);
const ov2 = await api("/api/admin/overview", { jarName: "admin" });
const clusterCount = ov2.data.fraud?.clusters?.length ?? 0;
clusterCount >= 1
  ? ok(`IP cluster flagged (${clusterCount})`)
  : bad(`expected cluster flag, got ${clusterCount}`);

console.log(`\n═══════ RESULT: ${pass} passed, ${fail} failed ═══════`);
process.exit(fail === 0 ? 0 : 1);
