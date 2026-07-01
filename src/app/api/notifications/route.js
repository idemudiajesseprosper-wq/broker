import { protect } from "@root/middleware/auth";
import { connectDB } from "@/config/db";
import Notification from "@/models/Notification";
import { serverError } from "@/utils/api";

export const runtime = "nodejs";

export async function GET(req) {
  try {
    await connectDB();

    const { userId } = protect(req);
    const notifications = await Notification.find({ userId }).sort({
      isRead: 1,
      createdAt: -1,
    });

    return Response.json({ notifications }, { status: 200 });
  } catch (error) {
    if (error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    return serverError(error);
  }
}
