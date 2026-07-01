import { protect } from "@root/middleware/auth";
import { connectDB } from "@/config/db";
import Account from "@/models/Account";
import { notFound, serverError } from "@/utils/api";

export const runtime = "nodejs";

export async function GET(req) {
  try {
    await connectDB();

    const { userId } = protect(req);
    const account = await Account.findOne({ userId });

    if (!account) {
      return notFound("Account not found");
    }

    return Response.json({ account }, { status: 200 });
  } catch (error) {
    if (error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    return serverError(error);
  }
}
