import { adminOnly } from "@root/middleware/adminOnly";
import { connectDB } from "@/config/db";
import Account from "@/models/Account";
import Investment from "@/models/Investment";
import KYC from "@/models/KYC";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { serverError } from "@/utils/api";

export const runtime = "nodejs";

export async function GET(req) {
  try {
    await connectDB();
    adminOnly(req);

    const [
      totalUsers,
      verifiedUsers,
      pendingKYC,
      deposits,
      withdrawals,
      profitAccounts,
      activeInvestments,
      completedInvestments,
      pendingWithdrawals,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
      KYC.countDocuments({ status: "pending" }),
      Transaction.aggregate([
        { $match: { status: "approved", type: "deposit" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        { $match: { status: "approved", type: "withdrawal" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Account.aggregate([
        { $group: { _id: null, total: { $sum: "$totalProfit" } } },
      ]),
      Investment.countDocuments({ status: "active" }),
      Investment.countDocuments({ status: "completed" }),
      Transaction.countDocuments({ status: "pending", type: "withdrawal" }),
    ]);

    return Response.json(
      {
        activeInvestments,
        completedInvestments,
        pendingKYC,
        pendingWithdrawals,
        totalDeposits: deposits[0]?.total || 0,
        totalProfit: profitAccounts[0]?.total || 0,
        totalUsers,
        totalWithdrawals: withdrawals[0]?.total || 0,
        verifiedUsers,
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
