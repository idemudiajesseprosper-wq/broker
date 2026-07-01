import crypto from "node:crypto";
import { connectDB } from "@/config/db";
import User from "@/models/User";
import { serverError } from "@/utils/api";
import { sendPasswordResetEmail } from "@/utils/email";

export const runtime = "nodejs";

const genericMessage = "If that email exists, a reset link has been sent.";

// Sends a password reset email without revealing whether the email exists.
export async function POST(req) {
  try {
    await connectDB();

    const { email } = await req.json();
    const user = email ? await User.findOne({ email }) : null;

    if (user) {
      const passwordResetToken = crypto.randomBytes(32).toString("hex");
      user.passwordResetToken = passwordResetToken;
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();
      await sendPasswordResetEmail(user.email, passwordResetToken);
    }

    return Response.json({ message: genericMessage }, { status: 200 });
  } catch (error) {
    return serverError(error);
  }
}
