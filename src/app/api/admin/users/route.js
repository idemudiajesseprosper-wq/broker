import { adminOnly } from "@root/middleware/adminOnly";
import { connectDB } from "@/config/db";
import User from "@/models/User";
import { getPagination, serverError } from "@/utils/api";

export const runtime = "nodejs";

export async function GET(req) {
  try {
    await connectDB();
    adminOnly(req);

    const searchParams = new URL(req.url).searchParams;
    const { limit, page, skip } = getPagination(searchParams);
    const search = searchParams.get("search");
    const query = {
      deletedAt: null,
      ...(search
        ? {
            $or: [
              { email: { $regex: search, $options: "i" } },
              { fullName: { $regex: search, $options: "i" } },
            ],
          }
        : {}),
    };

    const [users, totalCount] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    return Response.json(
      {
        currentPage: page,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        users,
      },
      { status: 200 },
    );
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
