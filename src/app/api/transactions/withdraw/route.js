import { protect } from "@root/middleware/auth";
import { connectDB } from "@/config/db";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import { badRequest, serverError } from "@/utils/api";
import { createNotification } from "@/utils/createNotification";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    await connectDB();

    const { userId } = protect(req);
    const {
      accountName,
      accountNumber,
      address,
      amount,
      bankName,
      routingNumber,
      walletAddress,
      withdrawalMethod = "Transfer",
    } = await req.json();
    const usdAmount = Number(amount);
    const usesBankDetails = withdrawalMethod === "Transfer";
    const usesWireDetails = withdrawalMethod === "Wire Transfer";
    const usesZelleDetails = withdrawalMethod === "Zelle";
    const needsDestination = [
      "Bitcoin",
      "Paypal",
      "Zelle",
      "Cash App",
    ].includes(withdrawalMethod);

    if (!usdAmount || usdAmount < 20) {
      return badRequest("Minimum withdrawal is $20");
    }

    if (usesBankDetails && (!bankName || !accountNumber || !accountName)) {
      return badRequest(
        "Bank name, account number, and account name are required",
      );
    }

    if (
      usesWireDetails &&
      (!accountName ||
        !accountNumber ||
        !address ||
        !bankName ||
        !routingNumber)
    ) {
      return badRequest(
        "Account name, account number, address, bank name, and routine number are required",
      );
    }

    if (needsDestination && !walletAddress) {
      return badRequest("Withdrawal destination is required");
    }

    if (usesZelleDetails && !accountNumber) {
      return badRequest("Zelle phone number is required");
    }

    const account = await Account.findOne({ userId });

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
        accountNumber:
          usesBankDetails || usesWireDetails || usesZelleDetails
            ? accountNumber
            : walletAddress,
        address,
        bankName:
          usesBankDetails || usesWireDetails ? bankName : withdrawalMethod,
        routingNumber,
      },
      status: "pending",
      type: "withdrawal",
      userId,
      walletAddress:
        usesBankDetails || usesWireDetails ? undefined : walletAddress,
      withdrawalMethod,
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
