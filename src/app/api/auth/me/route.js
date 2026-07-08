import { protect } from "@root/middleware/auth";
import { connectDB } from "@/config/db";
import User from "@/models/User";
import { serverError, unauthorized } from "@/utils/api";

export const runtime = "nodejs";

export async function GET(req) {
  try {
    await connectDB();

    const { userId } = protect(req);
    const user = await User.findById(userId).select(
      "deletedAt fullName email role kycStatus isVerified status",
    );

    if (!user || user.deletedAt || user.status === "suspended") {
      return unauthorized();
    }

    return Response.json(
      {
        user: {
          email: user.email,
          fullName: user.fullName,
          id: user._id.toString(),
          isVerified: user.isVerified,
          kycStatus: user.kycStatus,
          role: user.role,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    if (error.message === "Unauthorized") {
      return unauthorized();
    }

    return serverError(error);
  }
}
