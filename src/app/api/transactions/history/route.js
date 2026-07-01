import { protect } from "@root/middleware/auth";
import { connectDB } from "@/config/db";
import Transaction from "@/models/Transaction";
import { getPagination, serverError } from "@/utils/api";

export const runtime = "nodejs";

export async function GET(req) {
  try {
    await connectDB();

    const { userId } = protect(req);
    const searchParams = new URL(req.url).searchParams;
    const { limit, page, skip } = getPagination(searchParams);
    const query = { userId };

    if (searchParams.get("type")) {
      query.type = searchParams.get("type");
    }

    if (searchParams.get("status")) {
      query.status = searchParams.get("status");
    }

    const [transactions, totalCount] = await Promise.all([
      Transaction.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Transaction.countDocuments(query),
    ]);

    return Response.json(
      {
        currentPage: page,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        transactions,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    return serverError(error);
  }
}
