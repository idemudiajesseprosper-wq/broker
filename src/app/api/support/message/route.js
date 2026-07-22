import { badRequest, serverError } from "@/utils/api";
import { notifyZohoDirectSmartsuppMessage } from "@/utils/zoho";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const pageUrl =
      typeof body.pageUrl === "string" ? body.pageUrl.slice(0, 2000) : "";
    const conversationId =
      typeof body.conversationId === "string"
        ? body.conversationId.slice(0, 100)
        : "";
    const visitorId =
      typeof body.visitorId === "string" ? body.visitorId.slice(0, 100) : "";

    if (!message) {
      return badRequest("Message is required");
    }

    if (message.length > 4000) {
      return badRequest("Message is too long");
    }

    const result = await notifyZohoDirectSmartsuppMessage({
      conversationId,
      message,
      pageUrl,
      visitorId,
    });

    if (result?.skipped) {
      console.error(`Zoho notification skipped: ${result.reason}`);
      return Response.json(
        { error: "Email is not configured" },
        { status: 503 },
      );
    }

    return Response.json({ delivered: true }, { status: 202 });
  } catch (error) {
    return serverError(error);
  }
}
