import { adminOnly } from "@root/middleware/adminOnly";
import { connectDB } from "@/config/db";
import Account from "@/models/Account";
import AuditLog from "@/models/AuditLog";
import Bonus from "@/models/Bonus";
import Deposit from "@/models/Deposit";
import Notification from "@/models/Notification";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import Withdrawal from "@/models/Withdrawal";
import { ensureDefaultAdmin } from "@/utils/adminSeed";
import { serverError } from "@/utils/api";

export const runtime = "nodejs";

function monthKey(date) {
  return date.toLocaleString("en", { month: "short" });
}

function mapMonthly(docs, valueKey = "amount") {
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    return { month: monthKey(date), total: 0 };
  });
  const byMonth = new Map(months.map((item) => [item.month, item]));

  for (const doc of docs) {
    const key = monthKey(new Date(doc.createdAt));
    if (byMonth.has(key)) {
      byMonth.get(key).total += Number(doc[valueKey] || 0);
    }
  }

  return months;
}

export async function GET(req) {
  try {
    await connectDB();
    await ensureDefaultAdmin();
    adminOnly(req);

    const since = new Date();
    since.setMonth(since.getMonth() - 5);
    since.setDate(1);

    const [
      users,
      accounts,
      transactions,
      bonuses,
      deposits,
      withdrawals,
      notifications,
      auditLogs,
    ] = await Promise.all([
      User.find({ deletedAt: null })
        .select("-password")
        .sort({ createdAt: -1 }),
      Account.find().populate("userId", "fullName email username"),
      Transaction.find()
        .populate("userId", "fullName email")
        .sort({ createdAt: -1 }),
      Bonus.find().populate("userId", "fullName email").sort({ createdAt: -1 }),
      Deposit.find()
        .populate("userId", "fullName email")
        .sort({ createdAt: -1 }),
      Withdrawal.find()
        .populate("userId", "fullName email")
        .sort({ createdAt: -1 }),
      Notification.find()
        .populate("userId", "fullName email")
        .sort({ createdAt: -1 })
        .limit(25),
      AuditLog.find()
        .populate("userId", "fullName email")
        .sort({ createdAt: -1 })
        .limit(30),
    ]);

    const approvedDeposits = transactions.filter(
      (item) => item.type === "deposit" && item.status === "approved",
    );
    const approvedWithdrawals = transactions.filter(
      (item) => item.type === "withdrawal" && item.status === "approved",
    );

    return Response.json({
      accounts,
      auditLogs,
      bonuses,
      charts: {
        bonuses: mapMonthly(bonuses.filter((item) => item.createdAt >= since)),
        deposits: mapMonthly(
          approvedDeposits.filter((item) => item.createdAt >= since),
        ),
        newUsers: mapMonthly(
          users.filter((item) => item.createdAt >= since),
          "_count",
        ).map((item) => ({
          month: item.month,
          total: users.filter(
            (user) => monthKey(new Date(user.createdAt)) === item.month,
          ).length,
        })),
        withdrawals: mapMonthly(
          approvedWithdrawals.filter((item) => item.createdAt >= since),
        ),
      },
      deposits,
      metrics: {
        activeUsers: users.filter((user) => user.status !== "suspended").length,
        pendingDeposits:
          deposits.filter((item) => item.status === "pending").length +
          transactions.filter(
            (item) => item.type === "deposit" && item.status === "pending",
          ).length,
        pendingWithdrawals:
          withdrawals.filter((item) => item.status === "pending").length +
          transactions.filter(
            (item) => item.type === "withdrawal" && item.status === "pending",
          ).length,
        totalBalances: accounts.reduce(
          (sum, item) => sum + Number(item.balance || 0),
          0,
        ),
        totalBonuses: bonuses.reduce(
          (sum, item) => sum + Number(item.amount || 0),
          0,
        ),
        totalDeposits: approvedDeposits.reduce(
          (sum, item) => sum + Number(item.amount || 0),
          0,
        ),
        totalUsers: users.length,
        totalWithdrawals: approvedWithdrawals.reduce(
          (sum, item) => sum + Number(item.amount || 0),
          0,
        ),
      },
      notifications,
      recentActivity: [...auditLogs, ...transactions].slice(0, 12),
      transactions,
      users,
      withdrawals,
    });
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
