import { adminOnly } from "@root/middleware/adminOnly";
import { connectDB } from "@/config/db";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import { badRequest, notFound, serverError } from "@/utils/api";
import { logAdminAction } from "@/utils/audit";
import { createNotification } from "@/utils/createNotification";

export const runtime = "nodejs";

export async function PUT(req, context) {
  try {
    await connectDB();
    const admin = adminOnly(req);

    const { id } = await context.params;
    const { amount, type, note } = await req.json();
    const adjustmentAmount = Number(amount);

    if (!adjustmentAmount || !["credit", "debit"].includes(type)) {
      return badRequest("Amount and adjustment type are required");
    }

    const account = await Account.findById(id);

    if (!account) {
      return notFound("Account not found");
    }

    if (type === "debit" && account.balance < adjustmentAmount) {
      return badRequest("Insufficient account balance");
    }

    const previousBalance = account.balance;
    account.balance += type === "credit" ? adjustmentAmount : -adjustmentAmount;
    await account.save();

    await Transaction.create({
      accountId: account._id,
      amount: adjustmentAmount,
      note,
      status: "approved",
      type: "balance_adjustment",
      userId: account.userId,
    });

    await logAdminAction({
      action: "Balance Edited",
      adminId: admin.userId,
      ipAddress: req.headers.get("x-forwarded-for"),
      newValue: { balance: account.balance, note, type },
      previousValue: { balance: previousBalance },
      userId: account.userId,
    });

    await createNotification(
      account.userId,
      "Balance adjusted",
      `Your account was ${type === "credit" ? "credited" : "debited"} by $${adjustmentAmount}.`,
      "system",
    );

    return Response.json({ account }, { status: 200 });
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
