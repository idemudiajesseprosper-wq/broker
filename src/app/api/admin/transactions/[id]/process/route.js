import { adminOnly } from "@root/middleware/adminOnly";
import { connectDB } from "@/config/db";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import { badRequest, notFound, serverError } from "@/utils/api";
import { createNotification } from "@/utils/createNotification";

export const runtime = "nodejs";

export async function PUT(req, context) {
  try {
    await connectDB();
    adminOnly(req);

    const { id } = await context.params;
    const { action, note } = await req.json();

    if (!["approve", "reject"].includes(action)) {
      return badRequest("Action must be approve or reject");
    }

    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return notFound("Transaction not found");
    }

    if (transaction.status !== "pending") {
      return badRequest("Transaction has already been processed");
    }

    transaction.status = action === "approve" ? "approved" : "rejected";
    transaction.note = note;
    transaction.processedAt = new Date();
    await transaction.save();

    if (transaction.type === "deposit" && action === "approve") {
      await Account.findByIdAndUpdate(transaction.accountId, {
        $inc: {
          totalDeposited: transaction.amount,
        },
      });
    }

    if (transaction.type === "withdrawal" && action === "reject") {
      await Account.findByIdAndUpdate(transaction.accountId, {
        $inc: {
          balance: transaction.amount,
          totalWithdrawn: -transaction.amount,
        },
      });
    }

    await createNotification(
      transaction.userId,
      "Transaction processed",
      action === "approve"
        ? `Your ${transaction.type} of $${transaction.amount} was approved.`
        : `Your ${transaction.type} of $${transaction.amount} was rejected.`,
      transaction.type === "withdrawal" ? "withdrawal" : "deposit",
    );

    return Response.json({ transaction }, { status: 200 });
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
