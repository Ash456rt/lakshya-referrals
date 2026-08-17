import { db, adminEmails } from "@/lib/db";

type Email = {
  to: string | string[];
  subject: string;
  html: string;
};

/**
 * Email service. Uses Resend when RESEND_API_KEY is set; otherwise logs the
 * email to the console (dev mode) so the app works with zero configuration.
 */
export async function sendEmail({ to, subject, html }: Email) {
  const recipients = Array.isArray(to) ? to : [to];
  const from = process.env.EMAIL_FROM || "Lakshya Referrals <onboarding@resend.dev>";

  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const results = await Promise.allSettled(
      recipients.map((r) =>
        resend.emails.send({ from, to: r, subject, html })
      )
    );
    results.forEach((r, i) => {
      if (r.status === "rejected")
        console.error(`[email] failed to ${recipients[i]}:`, r.reason);
    });
    return;
  }

  // Dev fallback — make the emails visible in the server log.
  console.log(
    "\n────── 📧 [dev email] ──────\n" +
      `to:      ${recipients.join(", ")}\n` +
      `subject: ${subject}\n` +
      `body:\n${html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}\n` +
      "─────────────────────────────\n"
  );
}

/* ---------- Business emails ---------- */

export async function notifyWithdrawalRequested({
  userName,
  amountRs,
  points,
  bankName,
  accountHolder,
  accountNo,
  ifsc,
  requestedAt,
}: {
  userName: string;
  amountRs: number;
  points: number;
  bankName: string;
  accountHolder: string;
  accountNo: string;
  ifsc: string;
  requestedAt: string;
}) {
  const configured = adminEmails();
  const admins =
    configured.length > 0
      ? configured
      : db
          .prepare("SELECT email FROM users WHERE role IN ('admin','superadmin')")
          .all()
          .map((r) => (r as { email: string }).email);

  await sendEmail({
    to: admins,
    subject: `💰 Withdrawal request — ₹${amountRs} (${points} pts) from ${userName}`,
    html: `
      <h2>New withdrawal request</h2>
      <p><strong>Referrer:</strong> ${userName}</p>
      <p><strong>Amount:</strong> ₹${amountRs} (${points} points)</p>
      <p><strong>Requested at:</strong> ${requestedAt} UTC</p>
      <h3>Bank details</h3>
      <table cellpadding="6" style="border-collapse:collapse">
        <tr><td><strong>Bank</strong></td><td>${bankName}</td></tr>
        <tr><td><strong>Account holder</strong></td><td>${accountHolder}</td></tr>
        <tr><td><strong>Account no</strong></td><td>${accountNo}</td></tr>
        <tr><td><strong>IFSC</strong></td><td>${ifsc}</td></tr>
      </table>
      <p style="color:#64748d">SLA: transfer within 24 hours of this request. Log in to the admin dashboard to approve &amp; mark as paid.</p>
    `,
  });
}

export async function notifyWithdrawalPaid(userEmail: string, amountRs: number) {
  await sendEmail({
    to: userEmail,
    subject: `✅ ₹${amountRs} paid to your bank`,
    html: `
      <h2>Payout completed</h2>
      <p>Your withdrawal of <strong>₹${amountRs}</strong> has been transferred to your bank account.</p>
      <p>Keep sharing your link — every paid project earns you more points.</p>
    `,
  });
}

export async function notifyWithdrawalRejected(
  userEmail: string,
  amountRs: number,
  notes: string
) {
  await sendEmail({
    to: userEmail,
    subject: `Withdrawal request needs attention`,
    html: `
      <h2>Withdrawal not processed</h2>
      <p>Your request for <strong>₹${amountRs}</strong> was not processed.</p>
      <p><strong>Reason:</strong> ${notes}</p>
      <p>The points have been returned to your balance. Please re-check your bank details and try again.</p>
    `,
  });
}

export async function notifyPointsCredited(
  userEmail: string,
  points: number,
  projectName: string
) {
  await sendEmail({
    to: userEmail,
    subject: `🎉 You earned ${points} points from a referral`,
    html: `
      <h2>New points credited</h2>
      <p><strong>+${points} points</strong> landed in your account for the referral on <strong>${projectName}</strong>.</p>
      <p>Every 4 points = ₹1. Reach 2,000 points to withdraw ₹500 to your bank.</p>
    `,
  });
}
