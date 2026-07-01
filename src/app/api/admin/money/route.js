import { adminOnly } from "@root/middleware/adminOnly";
import { z } from "zod";
import { connectDB } from "@/config/db";
import Bonus from "@/models/Bonus";
import Deposit from "@/models/Deposit";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import Withdrawal from "@/models/Withdrawal";
import { createAccountForUser } from "@/utils/account";
import { badRequest, serverError } from "@/utils/api";
import { logAdminAction } from "@/utils/audit";
import { createNotification } from "@/utils/createNotification";
import { sendPlainEmail } from "@/utils/email";

export const runtime = "nodejs";

const moneySchema = z.object({
  action: z.enum(["deposit", "withdraw", "bonus"]),
  amount: z.coerce.number().positive(),
  bonusType: z.string().optional(),
  note: z.string().min(2),
  userId: z.string().min(1),
});

export async function POST(req) {
  try {
    await connectDB();
    const admin = adminOnly(req);
    const parsed = moneySchema.safeParse(await req.json());

    if (!parsed.success) {
      return badRequest("Select a user, action, amount, and note");
    }

    const data = parsed.data;
    const user = await User.findById(data.userId).select("fullName email");

    if (!user) {
      return badRequest("User not found");
    }

    const account = await createAccountForUser(data.userId);
    const amount = Number(data.amount);
    const previousBalance = Number(account.balance || 0);

    if (data.action === "withdraw" && previousBalance < amount) {
      return badRequest("Insufficient account balance");
    }

    if (data.action === "withdraw") {
      account.balance = previousBalance - amount;
      account.totalWithdrawn = Number(account.totalWithdrawn || 0) + amount;
    } else {
      account.balance = previousBalance + amount;
      if (data.action === "deposit") {
        account.totalDeposited = Number(account.totalDeposited || 0) + amount;
      }
    }

    await account.save();

    let record = null;
    let transactionType = data.action;

    if (data.action === "deposit") {
      record = await Deposit.create({
        amount,
        internalNote: data.note,
        paymentMethod: "Admin manual",
        processedAt: new Date(),
        status: "approved",
        transactionReference: `ADMIN-${Date.now()}`,
        userId: data.userId,
      });
    }

    if (data.action === "withdraw") {
      transactionType = "withdrawal";
      record = await Withdrawal.create({
        amount,
        notes: data.note,
        processedAt: new Date(),
        status: "approved",
        userId: data.userId,
      });
    }

    if (data.action === "bonus") {
      record = await Bonus.create({
        amount,
        bonusType: data.bonusType || "Admin bonus",
        reason: data.note,
        userId: data.userId,
      });
    }

    await Transaction.create({
      accountId: account._id,
      amount,
      note: data.note,
      processedAt: new Date(),
      status: "approved",
      type: transactionType,
      userId: data.userId,
    });

    await logAdminAction({
      action: `Manual ${data.action}`,
      adminId: admin.userId,
      ipAddress: req.headers.get("x-forwarded-for"),
      newValue: { amount, balance: account.balance, note: data.note },
      previousValue: { balance: previousBalance },
      userId: data.userId,
    });

    const messages = {
      bonus: {
        email: `Hello ${user.fullName || "there"}, your account has been credited with a bonus of $${amount}.`,
        notification: `Your account has been credited with a bonus of $${amount}.`,
        subject: "Your account has been credited with a bonus",
        title: "Bonus credited",
      },
      deposit: {
        email: `Hello ${user.fullName || "there"}, your account has been credited with $${amount}.`,
        notification: `Your account has been credited with $${amount}.`,
        subject: "Your account has been credited",
        title: "Account credited",
      },
      withdraw: {
        email: `Hello ${user.fullName || "there"}, a withdrawal of $${amount} has been made from your account.`,
        notification: `A withdrawal of $${amount} has been made from your account.`,
        subject: "Withdrawal made from your account",
        title: "Withdrawal made",
      },
    };

    const message = messages[data.action];

    await createNotification(
      data.userId,
      message.title,
      message.notification,
      "system",
    );

    try {
      await sendPlainEmail(user.email, message.subject, message.email);
    } catch (emailError) {
      console.error("Admin account action email failed", emailError);
    }

    return Response.json({ account, record }, { status: 201 });
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
