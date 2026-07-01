import { connectDB } from "@/config/db";
import User from "@/models/User";
import { badRequest, serverError } from "@/utils/api";

export const runtime = "nodejs";

// Resets a password using a valid reset token.
export async function POST(req) {
  try {
    await connectDB();

    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return badRequest("Token and new password are required");
    }

    const user = await User.findOne({
      passwordResetExpires: { $gt: new Date() },
      passwordResetToken: token,
    });

    if (!user) {
      return badRequest("Invalid or expired reset token");
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return Response.json(
      { message: "Password reset successful." },
      { status: 200 },
    );
  } catch (error) {
    return serverError(error);
  }
}
