import crypto from "node:crypto";
import { serverError } from "@/utils/api";
import { notifySmartsuppChatStart } from "@/utils/smartsupp";
import { notifyTitanChatStart } from "@/utils/titan";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { message, pageUrl } = await req.json();
    const visitorId = crypto.randomUUID();
    const supportMessage =
      message ||
      "Welcome 👋 Whether you have a specific question or need assistance, we're here for you. 😉 What would you like to know?";

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
      results.titan = await notifyTitanChatStart({
        message: supportMessage,
        pageUrl,
        visitorId,
      });
    } catch (error) {
      console.error("Titan chat-start notification failed:", error);
      results.titan = { error: error.message };
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
