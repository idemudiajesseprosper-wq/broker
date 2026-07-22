import { adminOnly } from "@root/middleware/adminOnly";
import { connectDB } from "@/config/db";
import User from "@/models/User";
import { badRequest, notFound, serverError } from "@/utils/api";
import { logAdminAction } from "@/utils/audit";
import { isAcceptablePassword } from "@/utils/password";

export const runtime = "nodejs";

export async function PUT(req) {
  try {
    await connectDB();
    const adminSession = adminOnly(req);
    const { confirmPassword, currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return badRequest(
        "Current password, new password, and confirmation are required",
      );
    }

    if (newPassword !== confirmPassword) {
      return badRequest("New password and confirmation do not match");
    }

    if (!isAcceptablePassword(newPassword)) {
      return badRequest(
        "Use at least 8 characters with mixed-case letters, a number, or a symbol",
      );
    }

    const admin = await User.findOne({
      _id: adminSession.userId,
      deletedAt: null,
      role: "admin",
    }).select("+password");

    if (!admin) {
      return notFound("Administrator account not found");
    }

    if (!(await admin.comparePassword(currentPassword))) {
      return Response.json(
        { error: "Current password is incorrect" },
        { status: 401 },
      );
    }

    if (await admin.comparePassword(newPassword)) {
      return badRequest(
        "Choose a password different from your current password",
      );
    }

    admin.password = newPassword;
    await admin.save();

    await logAdminAction({
      action: "Admin password changed",
      adminId: admin._id,
      ipAddress: req.headers.get("x-forwarded-for"),
      newValue: { passwordChanged: true },
      previousValue: { passwordChanged: false },
      userId: admin._id,
    });

    return Response.json({ message: "Password changed successfully" });
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
