import { sendEmail } from "@/utils/email";

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function notifyZohoDirectSmartsuppMessage({
  client,
  message,
  pageUrl,
  visitorId,
}) {
  const zohoEmail = process.env.ZOHO_SUPPORT_EMAIL;

  if (!zohoEmail) {
    return { skipped: true, reason: "ZOHO_SUPPORT_EMAIL is not configured" };
  }

  const clientEmail = client?.email || "Not available (anonymous visitor)";
  const clientName = client?.name || "Website visitor";
  const threadId = client?.email || visitorId || "unknown-visitor";
  const contactLink = client?.email
    ? `<p><a href="mailto:${escapeHtml(client.email)}">Email this client directly</a></p>`
    : "";

  return sendEmail({
    html: `
      <p>You have a new support message that may need a reply.</p>
      <p><strong>Client:</strong> ${escapeHtml(clientName)}</p>
      <p><strong>Client email:</strong> ${escapeHtml(clientEmail)}</p>
      <blockquote>${escapeHtml(message)}</blockquote>
      <p><strong>Page:</strong> ${escapeHtml(pageUrl)}</p>
      <p><strong>Chat ID:</strong> ${escapeHtml(threadId)}</p>
      ${contactLink}
      <p><small>Reply to the client's email address directly. Replies to this notification are not sent to the website.</small></p>
    `,
    subject: `[Missed support message: ${threadId}] ${clientName}`,
    to: zohoEmail,
  });
}
