import { protect } from "@root/middleware/auth";
import { connectDB } from "@/config/db";
import Investment from "@/models/Investment";
import { serverError } from "@/utils/api";

export const runtime = "nodejs";

export async function GET(req) {
  try {
    await connectDB();

    const { userId } = protect(req);
    const investments = await Investment.find({ userId })
      .populate("planId")
      .sort({ startDate: -1 });

    return Response.json({ investments }, { status: 200 });
  } catch (error) {
    if (error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    return serverError(error);
  }
}
