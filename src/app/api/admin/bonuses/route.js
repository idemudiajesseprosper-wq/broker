import { adminOnly } from "@root/middleware/adminOnly";
import { z } from "zod";
import { connectDB } from "@/config/db";
import Bonus from "@/models/Bonus";
import Transaction from "@/models/Transaction";
import { createAccountForUser } from "@/utils/account";
import { badRequest, serverError } from "@/utils/api";
import { logAdminAction } from "@/utils/audit";
import { createNotification } from "@/utils/createNotification";

export const runtime = "nodejs";

const bonusSchema = z.object({
  amount: z.coerce.number().positive(),
  bonusType: z.string().min(2),
  description: z.string().optional(),
  expirationDate: z.string().optional(),
  reason: z.string().min(2),
  userId: z.string().min(1),
});

export async function POST(req) {
  try {
    await connectDB();
    const admin = adminOnly(req);
    const parsed = bonusSchema.safeParse(await req.json());

    if (!parsed.success) {
      return badRequest("Bonus amount, type, reason, and user are required");
    }

    const data = parsed.data;
    const account = await createAccountForUser(data.userId);
    const previousBalance = account.balance;

    account.balance += data.amount;
    await account.save();

    const bonus = await Bonus.create({
      amount: data.amount,
      bonusType: data.bonusType,
      description: data.description,
      expirationDate: data.expirationDate
        ? new Date(data.expirationDate)
        : undefined,
      reason: data.reason,
      userId: data.userId,
    });

    await Transaction.create({
      accountId: account._id,
      amount: data.amount,
      note: data.reason,
      status: "approved",
      type: "bonus",
      userId: data.userId,
    });

    await logAdminAction({
      action: "Bonus Added",
      adminId: admin.userId,
      ipAddress: req.headers.get("x-forwarded-for"),
      newValue: { amount: data.amount, balance: account.balance },
      previousValue: { balance: previousBalance },
      userId: data.userId,
    });

    await createNotification(
      data.userId,
      "Bonus added",
      `A ${data.bonusType} bonus of $${data.amount} was added to your account.`,
      "system",
    );

    return Response.json({ bonus }, { status: 201 });
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
