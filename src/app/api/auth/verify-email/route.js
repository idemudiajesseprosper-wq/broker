import { connectDB } from "@/config/db";
import User from "@/models/User";
import { createAccountForUser } from "@/utils/account";
import { badRequest, serverError } from "@/utils/api";

export const runtime = "nodejs";

// Verifies an email token and creates the user's trading account.
export async function GET(req) {
  try {
    await connectDB();

    const token = new URL(req.url).searchParams.get("token");

    if (!token) {
      return badRequest("Verification token is required");
    }

    const user = await User.findOne({
      emailVerificationExpires: { $gt: new Date() },
      emailVerificationToken: token,
    });

    if (!user) {
      return badRequest("Invalid or expired verification token");
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    await createAccountForUser(user._id);

    return Response.json(
      { message: "Email verified. You can now log in." },
      { status: 200 },
    );
  } catch (error) {
    return serverError(error);
  }
}
