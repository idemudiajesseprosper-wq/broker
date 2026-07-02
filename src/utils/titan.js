import { sendEmail } from "@/utils/email";

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function notifyTitanChatStart({ message, pageUrl, visitorId }) {
  const titanEmail = process.env.TITAN_SUPPORT_EMAIL;

  if (!titanEmail) {
    return { skipped: true, reason: "TITAN_SUPPORT_EMAIL is not configured" };
  }

  return sendEmail({
    html: `
      <p>A website visitor started a support chat.</p>
      <p><strong>Message:</strong> ${escapeHtml(message)}</p>
      <p><strong>Page:</strong> ${escapeHtml(pageUrl)}</p>
      <p><strong>Visitor ID:</strong> ${escapeHtml(visitorId)}</p>
    `,
    subject: "Website chat waiting for support",
    to: titanEmail,
  });
}
