import { protect } from "@root/middleware/auth";
import { connectDB } from "@/config/db";
import Account from "@/models/Account";
import Bonus from "@/models/Bonus";
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

    const bonusTotal = await Bonus.aggregate([
      { $match: { status: "active", userId: account.userId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const accountPayload = account.toObject();
    accountPayload.totalBonus =
      Number(accountPayload.totalBonus || 0) ||
      Number(bonusTotal[0]?.total || 0);

    return Response.json({ account: accountPayload }, { status: 200 });
  } catch (error) {
    if (error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    return serverError(error);
  }
}
