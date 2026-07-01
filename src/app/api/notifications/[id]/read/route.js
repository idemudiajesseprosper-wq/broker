import { protect } from "@root/middleware/auth";
import { connectDB } from "@/config/db";
import Notification from "@/models/Notification";
import { notFound, serverError } from "@/utils/api";

export const runtime = "nodejs";

export async function PUT(req, context) {
  try {
    await connectDB();

    const { userId } = protect(req);
    const { id } = await context.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return notFound("Notification not found");
    }

    return Response.json({ notification }, { status: 200 });
  } catch (error) {
    if (error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    return serverError(error);
  }
}
