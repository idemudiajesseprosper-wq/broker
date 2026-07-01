import { connectDB } from "@/config/db";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import { badRequest, serverError } from "@/utils/api";
import { createNotification } from "@/utils/createNotification";
import { verifyPaystackSignature } from "@/utils/paystack";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    await connectDB();

    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature || !verifyPaystackSignature(rawBody, signature)) {
      return badRequest("Invalid Paystack signature");
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
      const reference = event.data.reference;
      const transaction = await Transaction.findOne({
        paystackReference: reference,
        status: "pending",
        type: "deposit",
      });

      if (transaction) {
        transaction.status = "approved";
        transaction.processedAt = new Date();
        await transaction.save();

        await Account.findByIdAndUpdate(transaction.accountId, {
          $inc: {
            balance: transaction.amount,
            totalDeposited: transaction.amount,
          },
        });

        await createNotification(
          transaction.userId,
          "Deposit confirmed",
          `Deposit of $${transaction.amount} confirmed`,
          "deposit",
        );
      }
    }

    return Response.json({ received: true }, { status: 200 });
  } catch (error) {
    return serverError(error);
  }
}
