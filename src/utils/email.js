function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

function canSkipEmail() {
  return !process.env.RESEND_API_KEY;
}

export function buildUrl(path, token) {
  const url = new URL(path, getBaseUrl());
  url.searchParams.set("token", token);
  return url.toString();
}

export async function sendEmail({ to, subject, html, replyTo }) {
  if (!process.env.RESEND_API_KEY) {
    if (canSkipEmail()) {
      console.info(
        `Email skipped because RESEND_API_KEY is not configured. Recipient: ${to}. Subject: ${subject}.`,
      );
      return { skipped: true };
    }

    throw new Error("RESEND_API_KEY is not defined");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "Bitcoin Broker <onboarding@resend.dev>",
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject,
      to,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Resend email failed: ${text}`);
  }

  return response.json();
}

export async function sendVerificationEmail(email, token) {
  const verificationUrl = buildUrl("/verify-email", token);

  return sendEmail({
    to: email,
    subject: "Verify your Bitcoin Broker account",
    html: `<p>Verify your account by clicking this link:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p>`,
  });
}

export async function sendPasswordResetEmail(email, token) {
  const resetUrl = buildUrl("/reset-password", token);

  return sendEmail({
    to: email,
    subject: "Reset your Bitcoin Broker password",
    html: `<p>Reset your password by clicking this link:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });
}

export async function sendPlainEmail(email, subject, message) {
  return sendEmail({
    to: email,
    subject,
    html: `<p>${message}</p>`,
  });
}
