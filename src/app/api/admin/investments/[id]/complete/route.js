import { adminOnly } from "@root/middleware/adminOnly";
import { connectDB } from "@/config/db";
import Account from "@/models/Account";
import Investment from "@/models/Investment";
import Transaction from "@/models/Transaction";
import { badRequest, notFound, serverError } from "@/utils/api";
import { createNotification } from "@/utils/createNotification";

export const runtime = "nodejs";

export async function PUT(req, context) {
  try {
    await connectDB();
    adminOnly(req);

    const { id } = await context.params;
    const investment = await Investment.findById(id);

    if (!investment) {
      return notFound("Investment not found");
    }

    if (investment.status !== "active") {
      return badRequest("Investment is not active");
    }

    investment.status = "completed";
    investment.completedAt = new Date();
    await investment.save();

    await Account.findByIdAndUpdate(investment.accountId, {
      $inc: {
        btcHolding: -investment.amountInvested / investment.btcPriceAtEntry,
        totalProfit: investment.profit,
      },
    });

    await Transaction.create({
      accountId: investment.accountId,
      amount: investment.profit,
      note: "Investment matured",
      status: "approved",
      type: "profit",
      userId: investment.userId,
    });

    await createNotification(
      investment.userId,
      "Investment matured",
      `Your investment has matured. Profit of $${investment.profit} has been recorded.`,
      "investment",
    );

    return Response.json({ investment }, { status: 200 });
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
