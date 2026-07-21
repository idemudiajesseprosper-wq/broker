import { protect } from "@root/middleware/auth";
import { connectDB } from "@/config/db";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { badRequest, serverError } from "@/utils/api";
import { uploadImageFile } from "@/utils/cloudinary";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    await connectDB();

    const { userId } = protect(req);
    const payload = await req.formData();
    const amount = payload.get("amount");
    const paymentMethod = payload.get("paymentMethod");
    const paymentProof = payload.get("paymentProof");
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
      status: "pending",
      type: "deposit",
      userId,
    });

    return Response.json({ submitted: true }, { status: 200 });
  } catch (error) {
    if (error.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    return serverError(error);
  }
}
