import { replyToSmartsuppConversation } from "@/utils/smartsupp";
import { verifyHmac } from "@/utils/webhook";
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

export async function POST(req) {
  const body = await req.text();
  const hookSecret = req.headers.get("x-hook-secret");
  const signature = req.headers.get("x-hook-signature");

  // Zoho exposes this secret only on the first webhook request. Accept and log
  // that registration request so it can be saved securely afterward.
  if (hookSecret) {
    console.info("Zoho X-Hook-Secret (save securely):", hookSecret);
    return Response.json({ received: true });
  }

  if (
    !verifyHmac({
      body,
      encoding: "base64",
      secret: process.env.ZOHO_WEBHOOK_SECRET,
      signature,
    })
  ) {
    return Response.json(
      { error: "Invalid webhook signature" },
      { status: 403 },
    );
  }

  const payload = JSON.parse(body);
  const conversationId = getConversationId(payload.subject);
  const supportEmail = process.env.ZOHO_SUPPORT_EMAIL?.toLowerCase();
  const sender = String(payload.fromAddress || "").toLowerCase();

  if (!conversationId || !supportEmail || sender !== supportEmail) {
    return Response.json({ received: true, skipped: true });
  }

  const reply = stripHtml(payload.html || payload.summary);

  if (!reply) {
    return Response.json({ error: "Email reply was empty" }, { status: 400 });
  }

  try {
    await replyToSmartsuppConversation(conversationId, reply);
  } catch (error) {
    console.error("Could not send Zoho reply to Smartsupp:", error);
    return Response.json({ error: "Smartsupp reply failed" }, { status: 500 });
  }

  return Response.json({ replied: true });
}
