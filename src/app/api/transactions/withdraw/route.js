import { protect } from "@root/middleware/auth";
import { connectDB } from "@/config/db";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { badRequest, forbidden, serverError } from "@/utils/api";
import { createNotification } from "@/utils/createNotification";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    await connectDB();

    const { userId } = protect(req);
    const { amount, bankName, accountNumber, accountName } = await req.json();
    const usdAmount = Number(amount);

    if (!usdAmount || usdAmount < 20) {
      return badRequest("Minimum withdrawal is $20");
    }

    if (!bankName || !accountNumber || !accountName) {
      return badRequest(
        "Bank name, account number, and account name are required",
      );
    }

    const [user, account] = await Promise.all([
      User.findById(userId),
      Account.findOne({ userId }),
    ]);

    if (!user || user.kycStatus !== "approved") {
      return forbidden("KYC approval is required for withdrawals");
    }

    if (!account || account.balance < usdAmount) {
      return badRequest("Insufficient balance");
    }

    account.balance -= usdAmount;
    account.totalWithdrawn += usdAmount;
    await account.save();

    await Transaction.create({
      accountId: account._id,
      amount: usdAmount,
      bankDetails: {
        accountName,
        accountNumber,
        bankName,
      },
      status: "pending",
      type: "withdrawal",
      userId,
    });

    await createNotification(
      userId,
      "Withdrawal submitted",
      `Withdrawal request of $${usdAmount} submitted`,
      "withdrawal",
    );

    return Response.json(
      { message: "Withdrawal request submitted. Processing within 24 hours." },
      { status: 201 },
    );
  } catch (error) {
    if (error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    return serverError(error);
  }
}
