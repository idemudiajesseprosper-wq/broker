import { adminOnly } from "@root/middleware/adminOnly";
import { z } from "zod";
import { connectDB } from "@/config/db";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { badRequest, serverError } from "@/utils/api";
import { logAdminAction } from "@/utils/audit";

export const runtime = "nodejs";

const notificationSchema = z.object({
  message: z.string().min(2),
  target: z.enum(["single", "multiple", "all"]),
  title: z.string().min(2),
  type: z
    .enum(["kyc", "deposit", "withdrawal", "investment", "system"])
    .default("system"),
  userIds: z.array(z.string()).optional(),
});

export async function POST(req) {
  try {
    await connectDB();
    const admin = adminOnly(req);
    const parsed = notificationSchema.safeParse(await req.json());

    if (!parsed.success) {
      return badRequest("Notification title, message, and target are required");
    }

    const data = parsed.data;
    const users =
      data.target === "all"
        ? await User.find({ deletedAt: null, role: "client" }).select("_id")
        : await User.find({ _id: { $in: data.userIds || [] } }).select("_id");

    if (!users.length) {
      return badRequest("Select at least one user");
    }

    const notifications = await Notification.insertMany(
      users.map((user) => ({
        message: data.message,
        title: data.title,
        type: data.type,
        userId: user._id,
      })),
    );

    await logAdminAction({
      action: "Notification Sent",
      adminId: admin.userId,
      ipAddress: req.headers.get("x-forwarded-for"),
      newValue: {
        count: notifications.length,
        target: data.target,
        title: data.title,
      },
    });

    return Response.json({ count: notifications.length }, { status: 201 });
  } catch (error) {
    if (error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.status === 403) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    return serverError(error);
  }
}
