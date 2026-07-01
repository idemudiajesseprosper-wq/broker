import { protect } from "@root/middleware/auth";
import { connectDB } from "@/config/db";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { badRequest, serverError } from "@/utils/api";
import {
  generatePaystackReference,
  initializePaystackTransaction,
} from "@/utils/paystack";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    await connectDB();

    const { userId } = protect(req);
    const { amount } = await req.json();
    const usdAmount = Number(amount);

    if (!usdAmount || usdAmount < 10) {
      return badRequest("Minimum deposit is $10");
    }

    const exchangeRate = Number(process.env.USD_TO_NGN_RATE);

    if (!exchangeRate) {
      throw new Error("USD_TO_NGN_RATE is not defined");
    }

    const [user, account] = await Promise.all([
      User.findById(userId),
      Account.findOne({ userId }),
    ]);

    if (!user || !account) {
      return badRequest("User account is not ready");
    }

    const reference = generatePaystackReference(userId);
    const amountKobo = Math.round(usdAmount * exchangeRate * 100);
    const paystackData = await initializePaystackTransaction({
      amountKobo,
      email: user.email,
      reference,
    });

    await Transaction.create({
      accountId: account._id,
      amount: usdAmount,
      paystackReference: reference,
      status: "pending",
      type: "deposit",
      userId,
    });

    return Response.json(
      {
        authorizationUrl: paystackData.authorization_url,
        reference,
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
