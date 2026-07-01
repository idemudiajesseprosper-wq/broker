import { protect } from "@root/middleware/auth";
import { connectDB } from "@/config/db";
import Investment from "@/models/Investment";
import { notFound, serverError } from "@/utils/api";

export const runtime = "nodejs";

export async function GET(req, context) {
  try {
    await connectDB();

    const { userId } = protect(req);
    const { id } = await context.params;
    const investment = await Investment.findOne({ _id: id, userId }).populate(
      "planId",
    );

    if (!investment) {
      return notFound("Investment not found");
    }

    return Response.json({ investment }, { status: 200 });
  } catch (error) {
    if (error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    return serverError(error);
  }
}
