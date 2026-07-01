import { protect } from "@root/middleware/auth";
import { connectDB } from "@/config/db";
import Notification from "@/models/Notification";
import { serverError } from "@/utils/api";

export const runtime = "nodejs";

export async function PUT(req) {
  try {
    await connectDB();

    const { userId } = protect(req);
    await Notification.updateMany({ userId }, { isRead: true });

    return Response.json(
      { message: "Notifications marked as read" },
      { status: 200 },
    );
  } catch (error) {
    if (error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    return serverError(error);
  }
}
