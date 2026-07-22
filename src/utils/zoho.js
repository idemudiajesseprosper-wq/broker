import { sendEmail } from "@/utils/email";

export const SMARTSUPP_SUBJECT_PREFIX = "Smartsupp conversation";

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getMessageText(message) {
  if (typeof message === "string") return message;

  return (
    message?.content?.text ||
    message?.content ||
    message?.text ||
    "A visitor sent a new message."
  );
}

export async function notifyZohoSmartsuppMessage({ conversation, message }) {
  const zohoEmail = process.env.ZOHO_SUPPORT_EMAIL;
  const replyEmail = process.env.RESEND_REPLY_EMAIL;
  const conversationId = conversation?.id;

  if (!zohoEmail) {
    return { skipped: true, reason: "ZOHO_SUPPORT_EMAIL is not configured" };
  }

  if (!replyEmail) {
    return { skipped: true, reason: "RESEND_REPLY_EMAIL is not configured" };
  }

  if (!conversationId) {
    throw new Error("Smartsupp conversation id was not provided");
  }

  const visitorName =
    conversation?.contact?.name ||
    conversation?.visitor?.name ||
    "Website visitor";

  return sendEmail({
    html: `
      <p><strong>${escapeHtml(visitorName)}</strong> sent a Smartsupp message:</p>
      <blockquote>${escapeHtml(getMessageText(message))}</blockquote>
      <p>Reply to this email to send your response back into the visitor's Smartsupp conversation.</p>
      <p><small>Conversation ID: ${escapeHtml(conversationId)}</small></p>
    `,
    replyTo: replyEmail,
    subject: `[${SMARTSUPP_SUBJECT_PREFIX}: ${conversationId}] New visitor message`,
    to: zohoEmail,
  });
}

export async function notifyZohoChatStart({ message, pageUrl, visitorId }) {
  const zohoEmail = process.env.ZOHO_SUPPORT_EMAIL;

  if (!zohoEmail) {
    return { skipped: true, reason: "ZOHO_SUPPORT_EMAIL is not configured" };
  }

  return sendEmail({
    html: `
      <p>A website visitor started a support chat.</p>
      <p><strong>Message:</strong> ${escapeHtml(message)}</p>
      <p><strong>Page:</strong> ${escapeHtml(pageUrl)}</p>
      <p><strong>Visitor ID:</strong> ${escapeHtml(visitorId)}</p>
    `,
    subject: "Website chat waiting for support",
    to: zohoEmail,
  });
}

export async function notifyZohoDirectSmartsuppMessage({
  conversationId,
  message,
  pageUrl,
  visitorId,
}) {
  const zohoEmail = process.env.ZOHO_SUPPORT_EMAIL;

  if (!zohoEmail) {
    return { skipped: true, reason: "ZOHO_SUPPORT_EMAIL is not configured" };
  }

  const threadId = conversationId || visitorId || "unknown-visitor";

  return sendEmail({
    html: `
      <p>A website visitor sent a Smartsupp message:</p>
      <blockquote>${escapeHtml(message)}</blockquote>
      <p><strong>Page:</strong> ${escapeHtml(pageUrl)}</p>
      <p><strong>Chat ID:</strong> ${escapeHtml(threadId)}</p>
      <p><small>This notification was sent directly by the website and does not depend on a Smartsupp webhook.</small></p>
    `,
    subject: `[Smartsupp: ${threadId}] Website conversation`,
    to: zohoEmail,
  });
}
