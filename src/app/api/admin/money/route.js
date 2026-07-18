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
  action: z.enum([
    "deposit",
    "withdraw",
    "set_withdrawn",
    "bonus",
    "balance_credit",
    "balance_debit",
  ]),
  amount: z.coerce.number().nonnegative(),
  bonusType: z.string().optional(),
  note: z.string().min(2),
  userId: z.string().min(1),
}).refine((data) => data.action === "set_withdrawn" || data.amount > 0, {
  message: "Amount must be greater than zero",
  path: ["amount"],
});

function getTransactionType(action) {
  if (action === "balance_credit" || action === "balance_debit") {
    return "balance_adjustment";
  }

  if (action === "withdraw") {
    return "withdrawal";
  }

  return action;
}

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
    const previousTotalWithdrawn = Number(account.totalWithdrawn || 0);

    if (data.action === "balance_debit" && previousBalance < amount) {
      return badRequest("Insufficient account balance");
    }

    if (data.action === "balance_debit") {
      account.balance = previousBalance - amount;
    } else if (data.action === "balance_credit") {
      account.balance = previousBalance + amount;
    } else if (data.action === "deposit") {
      account.totalDeposited = Number(account.totalDeposited || 0) + amount;
    } else if (data.action === "withdraw") {
      account.totalWithdrawn = Number(account.totalWithdrawn || 0) + amount;
    } else if (data.action === "set_withdrawn") {
      account.totalWithdrawn = amount;
    } else if (data.action === "bonus") {
      account.totalBonus = Number(account.totalBonus || 0) + amount;
    }

    await account.save();

    let record = null;
    const transactionType = getTransactionType(data.action);

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

    if (data.action === "bonus") {
      record = await Bonus.create({
        amount,
        bonusType: data.bonusType || "Admin bonus",
        reason: data.note,
        userId: data.userId,
      });
    }

    if (data.action === "withdraw") {
      record = await Withdrawal.create({
        amount,
        notes: data.note,
        processedAt: new Date(),
        status: "approved",
        userId: data.userId,
      });
    }

    if (data.action !== "set_withdrawn") {
      await Transaction.create({
        accountId: account._id,
        amount,
        note: data.note,
        processedAt: new Date(),
        status: "approved",
        type: transactionType,
        userId: data.userId,
      });
    }

    await logAdminAction({
      action: `Manual ${data.action}`,
      adminId: admin.userId,
      ipAddress: req.headers.get("x-forwarded-for"),
      newValue: {
        amount,
        balance: account.balance,
        note: data.note,
        totalWithdrawn: account.totalWithdrawn,
      },
      previousValue: {
        balance: previousBalance,
        totalWithdrawn: previousTotalWithdrawn,
      },
      userId: data.userId,
    });

    const messages = {
      bonus: {
        email: `Hello ${user.fullName || "there"}, your account has been credited with a bonus of $${amount}.`,
        notification: `Your account has been credited with a bonus of $${amount}.`,
        subject: "Your account has been credited with a bonus",
        title: "Bonus credited",
      },
      balance_credit: {
        email: `Hello ${user.fullName || "there"}, your account balance has been credited with $${amount}.`,
        notification: `Your account balance has been credited with $${amount}.`,
        subject: "Your balance has been credited",
        title: "Balance credited",
      },
      balance_debit: {
        email: `Hello ${user.fullName || "there"}, your account balance has been debited by $${amount}.`,
        notification: `Your account balance has been debited by $${amount}.`,
        subject: "Your balance has been debited",
        title: "Balance debited",
      },
      deposit: {
        email: `Hello ${user.fullName || "there"}, an active deposit of $${amount} has been added to your account.`,
        notification: `An active deposit of $${amount} has been added to your account.`,
        subject: "Active deposit added",
        title: "Deposit added",
      },
      withdraw: {
        email: `Hello ${user.fullName || "there"}, a withdrawal record of $${amount} has been added to your account.`,
        notification: `A withdrawal record of $${amount} has been added to your account.`,
        subject: "Withdrawal record added",
        title: "Withdrawal added",
      },
      set_withdrawn: {
        email: `Hello ${user.fullName || "there"}, your lifetime withdrawal total has been updated to $${amount}.`,
        notification: `Your lifetime withdrawal total has been updated to $${amount}.`,
        subject: "Withdrawal total updated",
        title: "Withdrawal total updated",
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
