import { protect } from "@root/middleware/auth";
import { connectDB } from "@/config/db";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { badRequest, serverError } from "@/utils/api";
import { uploadImageFile } from "@/utils/cloudinary";
import {
  generatePaystackReference,
  initializePaystackTransaction,
} from "@/utils/paystack";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    await connectDB();

    const { userId } = protect(req);
    const contentType = req.headers.get("content-type") || "";
    const isManualDeposit = contentType.includes("multipart/form-data");
    const payload = isManualDeposit ? await req.formData() : await req.json();
    const amount = isManualDeposit ? payload.get("amount") : payload.amount;
    const paymentMethod = isManualDeposit
      ? payload.get("paymentMethod")
      : payload.paymentMethod;
    const paymentProof = isManualDeposit ? payload.get("paymentProof") : null;
    const usdAmount = Number(amount);

    if (!usdAmount || usdAmount < 10) {
      return badRequest("Minimum deposit is $10");
    }

    const [user, account] = await Promise.all([
      User.findById(userId),
      Account.findOne({ userId }),
    ]);

    if (!user || !account) {
      return badRequest("User account is not ready");
    }

    const reference = generatePaystackReference(userId);

    if (isManualDeposit) {
      if (!(paymentProof instanceof File) || !paymentProof.size) {
        return badRequest("Payment proof is required");
      }

      const proofUrl = await uploadImageFile(paymentProof, "broker-deposits");

      await Transaction.create({
        accountId: account._id,
        amount: usdAmount,
        note: "Manual deposit awaiting payment proof review",
        paymentMethod: paymentMethod || "Bank transfer",
        paymentProof: proofUrl,
        paystackReference: reference,
        status: "pending",
        type: "deposit",
        userId,
      });

      return Response.json({ reference }, { status: 200 });
    }

    const exchangeRate = Number(process.env.USD_TO_NGN_RATE);

    if (!exchangeRate) {
      throw new Error("USD_TO_NGN_RATE is not defined");
    }

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
