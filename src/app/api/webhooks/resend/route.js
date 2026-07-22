import { getReceivedEmail } from "@/utils/email";
import { replyToSmartsuppConversation } from "@/utils/smartsupp";
import { verifySvixWebhook } from "@/utils/webhook";
import { SMARTSUPP_SUBJECT_PREFIX } from "@/utils/zoho";

export const runtime = "nodejs";

function stripHtml(value) {
  return String(value || "")
    .replace(/<blockquote[\s\S]*$/i, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getConversationId(subject) {
  const escapedPrefix = SMARTSUPP_SUBJECT_PREFIX.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
  const match = String(subject || "").match(
    new RegExp(`\\[${escapedPrefix}:\\s*(co[\\w-]{8,16})\\]`, "i"),
  );
  return match?.[1];
}

function getAddress(value) {
  const match = String(value || "").match(/<([^>]+)>/);
  return (match?.[1] || value || "").trim().toLowerCase();
}

export async function POST(req) {
  const body = await req.text();

  if (
    !verifySvixWebhook({
      body,
      id: req.headers.get("svix-id"),
      secret: process.env.RESEND_WEBHOOK_SECRET,
      signature: req.headers.get("svix-signature"),
      timestamp: req.headers.get("svix-timestamp"),
    })
  ) {
    return Response.json(
      { error: "Invalid webhook signature" },
      { status: 403 },
    );
  }

  const event = JSON.parse(body);
  if (event.type !== "email.received") {
    return Response.json({ received: true });
  }

  try {
    const email = await getReceivedEmail(event.data?.email_id);
    const conversationId = getConversationId(email.subject);
    const sender = getAddress(email.from);
    const supportEmail = process.env.ZOHO_SUPPORT_EMAIL?.toLowerCase();
    const replyAddress = process.env.RESEND_REPLY_EMAIL?.toLowerCase();
    const wasSentToReplyAddress = email.to?.some(
      (address) => getAddress(address) === replyAddress,
    );

    if (!conversationId || sender !== supportEmail || !wasSentToReplyAddress) {
      return Response.json({ received: true, skipped: true });
    }

    const reply = email.text?.trim() || stripHtml(email.html);
    if (!reply) {
      return Response.json({ error: "Email reply was empty" }, { status: 400 });
    }

    await replyToSmartsuppConversation(conversationId, reply);
    return Response.json({ replied: true });
  } catch (error) {
    console.error("Could not send Resend reply to Smartsupp:", error);
    return Response.json({ error: "Smartsupp reply failed" }, { status: 500 });
  }
}
