import { verifyHmac } from "@/utils/webhook";
import { notifyZohoSmartsuppMessage } from "@/utils/zoho";

export const runtime = "nodejs";

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get("x-smartsupp-hmac");

  if (
    !verifyHmac({
      body,
      encoding: "hex",
      secret: process.env.SMARTSUPP_WEBHOOK_SECRET,
      signature,
    })
  ) {
    return Response.json(
      { error: "Invalid webhook signature" },
      { status: 403 },
    );
  }

  const payload = JSON.parse(body);

  if (payload.event !== "conversation.contact_replied") {
    return Response.json({ received: true });
  }

  try {
    await notifyZohoSmartsuppMessage(payload.data || {});
  } catch (error) {
    console.error("Could not forward Smartsupp message to Zoho:", error);
    return Response.json({ error: "Notification failed" }, { status: 500 });
  }

  return Response.json({ received: true });
}
