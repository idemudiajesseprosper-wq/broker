import crypto from "node:crypto";
import { serverError } from "@/utils/api";
import { notifySmartsuppChatStart } from "@/utils/smartsupp";
import { notifyZohoChatStart } from "@/utils/zoho";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { message, pageUrl } = await req.json();
    const visitorId = crypto.randomUUID();
    const supportMessage =
      message ||
      "Welcome! \u{1F44B} Whether you have a specific question or need assistance, we're here for you. \u{1F609} What would you like to know?";

    const results = {};

    try {
      results.smartsupp = await notifySmartsuppChatStart({
        message: supportMessage,
        pageUrl,
        visitorId,
      });
    } catch (error) {
      console.error("Smartsupp chat-start notification failed:", error);
      results.smartsupp = { error: error.message };
    }

    try {
      results.zoho = await notifyZohoChatStart({
        message: supportMessage,
        pageUrl,
        visitorId,
      });
    } catch (error) {
      console.error("Zoho chat-start notification failed:", error);
      results.zoho = { error: error.message };
    }

    return Response.json(
      {
        message: "Support chat started",
        results,
      },
      { status: 202 },
    );
  } catch (error) {
    return serverError(error);
  }
}
